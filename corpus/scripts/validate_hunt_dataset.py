#!/usr/bin/env python3
"""Validate a Puzzle Hunt Dataset v2 package.

JSON Schema covers the shape of each file and record.  This module adds the
cross-file checks which JSON Schema deliberately cannot express.  Schemas are
loaded into an in-memory registry; unresolved references fail instead of being
retrieved from the network.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import sys
from collections import defaultdict
from datetime import datetime
from pathlib import Path
from typing import Any, Iterable, Iterator, Mapping, Sequence

from jsonschema import Draft202012Validator, FormatChecker
from referencing import Registry, Resource
from rfc3339_validator import validate_rfc3339


SCHEMA_VERSION = "2.0.0"
TABLES = ("hunts", "groups", "puzzles", "relations", "assets", "sources")
COVERAGE_FACETS = ("puzzles", "statements", "answers", "solutions", "hints", "assets", "sources")
CROSS_HUNT_RELATION_TYPES = {"references", "variant_of", "instance_of", "replaces"}
SCHEMA_FILES = {
    "manifest": "manifest.schema.json",
    "hunts": "hunt.schema.json",
    "groups": "group.schema.json",
    "puzzles": "puzzle.schema.json",
    "relations": "relation.schema.json",
    "assets": "asset.schema.json",
    "sources": "source.schema.json",
}
ID_FIELDS = {
    "hunts": "hunt_id",
    "groups": "group_id",
    "puzzles": "puzzle_id",
    "relations": "relation_id",
    "assets": "asset_id",
    "sources": "source_id",
}
DEFAULT_SCHEMA_DIR = Path(__file__).resolve().parents[1] / "schema" / "hunt-dataset-v2"


class DatasetValidationError(ValueError):
    """Raised when a dataset package has one or more validation errors."""

    def __init__(self, errors: Sequence[str]):
        self.errors = tuple(errors)
        super().__init__(f"dataset validation failed with {len(self.errors)} error(s)")

    def __str__(self) -> str:
        detail = "\n".join(f"- {error}" for error in self.errors)
        return f"{super().__str__()}:\n{detail}"


def _reject_json_constant(value: str) -> None:
    raise ValueError(f"non-JSON numeric constant {value!r}")


def _reject_duplicate_keys(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
    result: dict[str, Any] = {}
    for key, value in pairs:
        if key in result:
            raise ValueError(f"duplicate object key {key!r}")
        result[key] = value
    return result


def _decode_json(data: bytes, label: str, errors: list[str]) -> Any | None:
    if data.startswith(b"\xef\xbb\xbf"):
        errors.append(f"{label}: UTF-8 BOM is not allowed")
        return None
    if b"\r" in data:
        errors.append(f"{label}: only LF line endings are allowed")
    try:
        text = data.decode("utf-8")
    except UnicodeDecodeError as exc:
        errors.append(f"{label}: is not valid UTF-8 ({exc})")
        return None
    try:
        return json.loads(
            text,
            parse_constant=_reject_json_constant,
            object_pairs_hook=_reject_duplicate_keys,
        )
    except (json.JSONDecodeError, ValueError) as exc:
        errors.append(f"{label}: invalid JSON ({exc})")
        return None


def _read_required_file(path: Path, label: str, errors: list[str]) -> bytes | None:
    try:
        if not path.is_file():
            errors.append(f"{label}: required file does not exist")
            return None
        return path.read_bytes()
    except OSError as exc:
        errors.append(f"{label}: cannot be read ({exc})")
        return None


def _read_jsonl(path: Path, label: str, errors: list[str]) -> tuple[list[dict[str, Any]], bytes | None]:
    data = _read_required_file(path, label, errors)
    if data is None:
        return [], None
    if data.startswith(b"\xef\xbb\xbf"):
        errors.append(f"{label}: UTF-8 BOM is not allowed")
        return [], data
    if b"\r" in data:
        errors.append(f"{label}: only LF line endings are allowed")
    try:
        text = data.decode("utf-8")
    except UnicodeDecodeError as exc:
        errors.append(f"{label}: is not valid UTF-8 ({exc})")
        return [], data

    records: list[dict[str, Any]] = []
    for line_number, line in enumerate(text.split("\n"), 1):
        if not line.strip():
            continue
        try:
            value = json.loads(
                line,
                parse_constant=_reject_json_constant,
                object_pairs_hook=_reject_duplicate_keys,
            )
        except (json.JSONDecodeError, ValueError) as exc:
            errors.append(f"{label}:{line_number}: invalid JSON ({exc})")
            continue
        if not isinstance(value, dict):
            errors.append(f"{label}:{line_number}: each non-empty line must be a JSON object")
            continue
        records.append(value)
    return records, data


def _json_path(parts: Iterable[Any]) -> str:
    result = "$"
    for part in parts:
        if isinstance(part, int):
            result += f"[{part}]"
        elif isinstance(part, str) and part.replace("_", "a").isalnum():
            result += f".{part}"
        else:
            result += f"[{part!r}]"
    return result


class _OfflineSchemas:
    def __init__(self, schema_dir: Path):
        self.schema_dir = schema_dir
        self.schemas: dict[str, Mapping[str, Any]] = {}
        self.format_checker = FormatChecker()
        self.format_checker.checks("date-time", raises=(TypeError, ValueError))(
            _is_strict_rfc3339
        )
        registry = Registry()

        schema_paths = sorted(schema_dir.glob("*.schema.json"))
        if not schema_paths:
            raise FileNotFoundError(f"no JSON schemas found in {schema_dir}")

        for path in schema_paths:
            raw = path.read_bytes()
            errors: list[str] = []
            schema = _decode_json(raw, str(path), errors)
            if errors:
                raise ValueError("; ".join(errors))
            if not isinstance(schema, dict):
                raise ValueError(f"{path}: schema root must be an object")
            dialect = schema.get("$schema")
            if dialect not in {
                "https://json-schema.org/draft/2020-12/schema",
                "https://json-schema.org/draft/2020-12/schema#",
            }:
                raise ValueError(f"{path}: schema must declare JSON Schema Draft 2020-12")
            Draft202012Validator.check_schema(schema)
            resource = Resource.from_contents(schema)
            registry = registry.with_resource(path.resolve().as_uri(), resource)
            schema_id = schema.get("$id")
            if isinstance(schema_id, str):
                registry = registry.with_resource(schema_id, resource)
            self.schemas[path.name] = schema

        missing = sorted(set(SCHEMA_FILES.values()) - set(self.schemas))
        if missing:
            raise FileNotFoundError(f"missing required schema file(s): {', '.join(missing)}")
        self.registry = registry

    def errors_for(self, schema_file: str, instance: Any) -> list[str]:
        validator = Draft202012Validator(
            self.schemas[schema_file],
            registry=self.registry,
            format_checker=self.format_checker,
        )
        validation_errors = sorted(
            validator.iter_errors(instance),
            key=lambda error: tuple(str(part) for part in error.absolute_path),
        )
        return [f"{_json_path(error.absolute_path)}: {error.message}" for error in validation_errors]


def _safe_dataset_path(root: Path, value: Any, label: str, errors: list[str]) -> Path | None:
    if not isinstance(value, str):
        errors.append(f"{label}: path must be a string")
        return None
    parts = value.split("/")
    if (
        not value
        or value.startswith("/")
        or "\\" in value
        or any(part in {"", ".", ".."} for part in parts)
    ):
        errors.append(f"{label}: path must be a normalized POSIX path relative to the dataset root")
        return None
    candidate = root.joinpath(*parts)
    try:
        resolved_root = root.resolve()
        resolved = candidate.resolve()
        if os.path.commonpath((str(resolved_root), str(resolved))) != str(resolved_root):
            errors.append(f"{label}: path escapes the dataset root after resolving symlinks")
            return None
    except (OSError, RuntimeError, ValueError) as exc:
        errors.append(f"{label}: path cannot be resolved safely ({exc})")
        return None
    return candidate


def _sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def _parse_rfc3339(value: str) -> datetime:
    normalized = value[:-1] + "+00:00" if value.endswith("Z") else value
    return datetime.fromisoformat(normalized)


def _is_strict_rfc3339(value: Any) -> bool:
    if not isinstance(value, str):
        return True
    return validate_rfc3339(value)


def _check_integrity(
    path: Path | None,
    expected_bytes: Any,
    expected_sha256: Any,
    label: str,
    errors: list[str],
    cache: dict[Path, bytes | None],
) -> None:
    if path is None:
        return
    if path not in cache:
        cache[path] = _read_required_file(path, label, errors)
    data = cache[path]
    if data is None:
        return
    if isinstance(expected_bytes, int) and not isinstance(expected_bytes, bool):
        if len(data) != expected_bytes:
            errors.append(f"{label}: bytes mismatch (manifest/record {expected_bytes}, actual {len(data)})")
    if isinstance(expected_sha256, str):
        actual = _sha256(data)
        if actual != expected_sha256.lower():
            errors.append(f"{label}: sha256 mismatch (record {expected_sha256}, actual {actual})")


def _walk_core(value: Any, path: tuple[Any, ...] = ()) -> Iterator[tuple[tuple[Any, ...], str, Any]]:
    """Walk core fields, treating namespaced extensions as opaque values."""
    if isinstance(value, dict):
        for key, child in value.items():
            child_path = path + (key,)
            yield child_path, key, child
            if key != "extensions":
                yield from _walk_core(child, child_path)
    elif isinstance(value, list):
        for index, child in enumerate(value):
            yield from _walk_core(child, path + (index,))


def _owner_hunt(table: str, record: Mapping[str, Any]) -> str | None:
    if table == "hunts":
        value = record.get("hunt_id")
    else:
        value = record.get("hunt_id")
    return value if isinstance(value, str) else None


def _record_label(table: str, index: int, record: Mapping[str, Any]) -> str:
    identifier = record.get(ID_FIELDS[table])
    return f"{table}.jsonl[{index}] ({identifier!r})"


def _check_reference_hunt(
    owner_hunt: str | None,
    referenced: Mapping[str, Any],
    reference: str,
    label: str,
    errors: list[str],
    allowed_hunts: set[str] | None = None,
) -> None:
    referenced_hunt = referenced.get("hunt_id")
    allowed = allowed_hunts if allowed_hunts is not None else {owner_hunt}
    if owner_hunt is not None and isinstance(referenced_hunt, str) and referenced_hunt not in allowed:
        errors.append(
            f"{label}: reference {reference!r} belongs to unrelated hunt {referenced_hunt!r}"
        )


def _find_asset_refs(value: Any, path: tuple[Any, ...] = ()) -> Iterator[tuple[tuple[Any, ...], Any]]:
    if isinstance(value, dict):
        for key, child in value.items():
            child_path = path + (key,)
            if key == "asset_refs" and isinstance(child, list):
                for index, ref in enumerate(child):
                    yield child_path + (index,), ref
            if key != "extensions":
                yield from _find_asset_refs(child, child_path)
    elif isinstance(value, list):
        for index, child in enumerate(value):
            yield from _find_asset_refs(child, path + (index,))


def _check_spoiler_floor(
    value: Any,
    floor: int,
    label: str,
    errors: list[str],
) -> None:
    for path, ref in _find_asset_refs(value):
        if not isinstance(ref, dict):
            continue
        level = ref.get("spoiler_level")
        if isinstance(level, int) and not isinstance(level, bool) and level < floor:
            errors.append(
                f"{label}{_json_path(path)[1:]}: spoiler_level {level} is below the required level {floor}"
            )


def _check_source_asset_levels(value: Any, label: str, errors: list[str]) -> None:
    """Treat archived implementation/source files as solution-level material."""
    for path, ref in _find_asset_refs(value):
        if not isinstance(ref, dict) or ref.get("role") != "source":
            continue
        level = ref.get("spoiler_level")
        if isinstance(level, int) and not isinstance(level, bool) and level < 3:
            errors.append(
                f"{label}{_json_path(path)[1:]}: source asset must use spoiler_level 3"
            )


def _detect_cycle(edges: Iterable[tuple[str, str]]) -> list[str] | None:
    adjacency: dict[str, list[str]] = defaultdict(list)
    for source, target in edges:
        adjacency[source].append(target)
    for targets in adjacency.values():
        targets.sort()

    state: dict[str, int] = {}
    stack: list[str] = []
    positions: dict[str, int] = {}

    def visit(node: str) -> list[str] | None:
        state[node] = 1
        positions[node] = len(stack)
        stack.append(node)
        for target in adjacency.get(node, ()):
            if state.get(target, 0) == 0:
                cycle = visit(target)
                if cycle:
                    return cycle
            elif state.get(target) == 1:
                return stack[positions[target] :] + [target]
        stack.pop()
        positions.pop(node, None)
        state[node] = 2
        return None

    for node in sorted(adjacency):
        if state.get(node, 0) == 0:
            cycle = visit(node)
            if cycle:
                return cycle
    return None


def _coverage_observed_counts(
    table_records: Mapping[str, Sequence[Mapping[str, Any]]],
    indexes: Mapping[str, Mapping[str, Mapping[str, Any]]],
) -> dict[str, dict[str, int]]:
    hunt_ids = indexes["hunts"]
    counts = {
        hunt_id: {facet: 0 for facet in COVERAGE_FACETS}
        for hunt_id in hunt_ids
    }
    assets_by_hunt: dict[str, set[str]] = {hunt_id: set() for hunt_id in hunt_ids}
    sources_by_hunt: dict[str, set[str]] = {hunt_id: set() for hunt_id in hunt_ids}

    for puzzle in table_records["puzzles"]:
        hunt_id = puzzle.get("hunt_id")
        if hunt_id not in counts:
            continue
        counts[hunt_id]["puzzles"] += 1
        for facet in ("statements", "solutions"):
            blocks = puzzle.get(facet)
            if isinstance(blocks, list):
                counts[hunt_id][facet] += sum(
                    isinstance(block, dict)
                    and block.get("availability") in {"available", "partial"}
                    for block in blocks
                )
        answers = puzzle.get("answers")
        if isinstance(answers, list):
            counts[hunt_id]["answers"] += sum(
                isinstance(answer, dict) and answer.get("counts_as_solve") is True
                for answer in answers
            )
        hints = puzzle.get("hints")
        if isinstance(hints, list):
            counts[hunt_id]["hints"] += sum(
                isinstance(hint, dict)
                and isinstance(hint.get("content"), dict)
                and hint["content"].get("availability") in {"available", "partial"}
                for hint in hints
            )

    for asset_id, asset in indexes["assets"].items():
        hunt_id = asset.get("hunt_id")
        if hunt_id in assets_by_hunt and asset.get("status") == "available":
            assets_by_hunt[hunt_id].add(asset_id)
    for source_id, source in indexes["sources"].items():
        hunt_id = source.get("hunt_id")
        if hunt_id in sources_by_hunt:
            sources_by_hunt[hunt_id].add(source_id)

    # Dataset-level resources count once for each hunt whose core records use them.
    for table in TABLES:
        for record in table_records[table]:
            hunt_id = record.get("hunt_id")
            if hunt_id not in counts:
                continue
            for _, key, value in _walk_core(record):
                if key in {"asset_id", "bundle_asset_id", "entrypoint_asset_id"}:
                    asset = indexes["assets"].get(value) if isinstance(value, str) else None
                    if asset is not None and "hunt_id" not in asset and asset.get("status") == "available":
                        assets_by_hunt[hunt_id].add(value)
                elif key in {"source_ids", "snapshot_source_ids"} and isinstance(value, list):
                    for source_id in value:
                        source = indexes["sources"].get(source_id)
                        if source is not None and "hunt_id" not in source:
                            sources_by_hunt[hunt_id].add(source_id)

    for hunt_id in counts:
        counts[hunt_id]["assets"] = len(assets_by_hunt[hunt_id])
        counts[hunt_id]["sources"] = len(sources_by_hunt[hunt_id])
    return counts


def collect_validation_errors(
    dataset_root: str | Path,
    schema_dir: str | Path | None = None,
) -> list[str]:
    """Return every validation error found in *dataset_root*.

    Schema loading errors are reported in the returned list as well.  No schema
    or dataset URI is ever fetched from the network.
    """
    root = Path(dataset_root)
    errors: list[str] = []
    if not root.is_dir():
        return [f"dataset root is not a directory: {root}"]

    try:
        schemas = _OfflineSchemas(Path(schema_dir) if schema_dir is not None else DEFAULT_SCHEMA_DIR)
    except Exception as exc:
        return [f"cannot load local Draft 2020-12 schemas: {exc}"]

    manifest_path = root / "manifest.json"
    manifest_data = _read_required_file(manifest_path, "manifest.json", errors)
    manifest: dict[str, Any] | None = None
    if manifest_data is not None:
        decoded = _decode_json(manifest_data, "manifest.json", errors)
        if isinstance(decoded, dict):
            manifest = decoded
            errors.extend(
                f"manifest.json: {message}"
                for message in schemas.errors_for(SCHEMA_FILES["manifest"], manifest)
            )
        elif decoded is not None:
            errors.append("manifest.json: root must be a JSON object")
    if manifest is None:
        return sorted(set(errors))

    table_records: dict[str, list[dict[str, Any]]] = {table: [] for table in TABLES}
    integrity_cache: dict[Path, bytes | None] = {}
    file_entries = manifest.get("files")
    if not isinstance(file_entries, dict):
        errors.append("manifest.json: $.files must describe all six JSONL tables")
        return sorted(set(errors))

    table_paths: dict[str, str] = {}
    for table in TABLES:
        descriptor = file_entries.get(table)
        if not isinstance(descriptor, dict):
            errors.append(f"manifest.json: $.files.{table} must be an object")
            continue
        descriptor_path = descriptor.get("path")
        if isinstance(descriptor_path, str):
            previous_table = table_paths.get(descriptor_path)
            if previous_table is not None:
                errors.append(
                    f"manifest.files.{table}.path duplicates manifest.files.{previous_table}.path"
                )
            else:
                table_paths[descriptor_path] = table
        path = _safe_dataset_path(root, descriptor_path, f"manifest.files.{table}.path", errors)
        if path is None:
            continue
        records, raw = _read_jsonl(path, str(descriptor.get("path")), errors)
        table_records[table] = records
        for index, record in enumerate(records):
            for message in schemas.errors_for(SCHEMA_FILES[table], record):
                errors.append(f"{descriptor.get('path')}:{index + 1}: {message}")
        expected_records = descriptor.get("records")
        if isinstance(expected_records, int) and not isinstance(expected_records, bool):
            if len(records) != expected_records:
                errors.append(
                    f"manifest.files.{table}.records mismatch (manifest {expected_records}, actual {len(records)})"
                )
        if raw is not None:
            _check_integrity(
                path,
                descriptor.get("bytes"),
                descriptor.get("sha256"),
                f"manifest.files.{table}",
                errors,
                integrity_cache,
            )

    # Entity identity, uniqueness, ownership, and hunt foreign keys.
    records_by_id: dict[str, tuple[str, Mapping[str, Any]]] = {}
    indexes: dict[str, dict[str, Mapping[str, Any]]] = {table: {} for table in TABLES}
    for table in TABLES:
        id_field = ID_FIELDS[table]
        for index, record in enumerate(table_records[table]):
            identifier = record.get(id_field)
            if not isinstance(identifier, str):
                continue
            label = _record_label(table, index, record)
            if identifier in indexes[table]:
                errors.append(f"{label}: duplicate {id_field} {identifier!r}")
            else:
                indexes[table][identifier] = record
            if identifier in records_by_id:
                previous_table, _ = records_by_id[identifier]
                errors.append(f"{label}: entity ID {identifier!r} is already used in {previous_table}.jsonl")
            else:
                records_by_id[identifier] = (table, record)

    hunt_ids = indexes["hunts"]
    for index, hunt in enumerate(table_records["hunts"]):
        start_at = hunt.get("start_at")
        end_at = hunt.get("end_at")
        if isinstance(start_at, str) and isinstance(end_at, str):
            try:
                if _parse_rfc3339(end_at) < _parse_rfc3339(start_at):
                    errors.append(f"{_record_label('hunts', index, hunt)}: end_at precedes start_at")
            except (TypeError, ValueError):
                pass  # The JSON Schema format checker reports the malformed value.
    for table in TABLES[1:]:
        id_field = ID_FIELDS[table]
        for index, record in enumerate(table_records[table]):
            label = _record_label(table, index, record)
            hunt_id = record.get("hunt_id")
            if isinstance(hunt_id, str) and hunt_id not in hunt_ids:
                errors.append(f"{label}: unknown hunt_id {hunt_id!r}")
            identifier = record.get(id_field)
            if not isinstance(identifier, str):
                continue
            if table in {"groups", "puzzles", "relations"} and isinstance(hunt_id, str):
                if not identifier.startswith(f"{hunt_id}:"):
                    errors.append(f"{label}: {id_field} must start with {hunt_id!r} followed by ':'")
            elif table in {"assets", "sources"}:
                global_prefix = "asset:" if table == "assets" else "source:"
                hunt_prefix = isinstance(hunt_id, str) and identifier.startswith(f"{hunt_id}:")
                if not hunt_prefix and not identifier.startswith(global_prefix):
                    errors.append(
                        f"{label}: {id_field} must use its hunt prefix or the dataset-level {global_prefix!r} prefix"
                    )

    # Hunt IDs in manifest coverage are also foreign keys.
    coverage = manifest.get("coverage")
    coverage_entries: dict[tuple[str, str], Mapping[str, Any]] = {}
    if isinstance(coverage, list):
        coverage_keys: set[tuple[str, str]] = set()
        for index, item in enumerate(coverage):
            if isinstance(item, dict):
                hunt_id = item.get("hunt_id")
                facet = item.get("facet")
                if isinstance(hunt_id, str) and hunt_id not in hunt_ids:
                    errors.append(f"manifest.coverage[{index}]: unknown hunt_id {hunt_id!r}")
                if isinstance(hunt_id, str) and isinstance(facet, str):
                    coverage_key = (hunt_id, facet)
                    if coverage_key in coverage_keys:
                        errors.append(
                            f"manifest.coverage[{index}]: duplicate coverage entry for "
                            f"{hunt_id!r}/{facet!r}"
                        )
                    coverage_keys.add(coverage_key)
                    coverage_entries[coverage_key] = item
                expected = item.get("expected")
                observed = item.get("observed")
                missing = item.get("missing")
                if all(
                    isinstance(value, int) and not isinstance(value, bool)
                    for value in (expected, observed, missing)
                ) and expected != observed + missing:
                    errors.append(
                        f"manifest.coverage[{index}]: expected must equal observed + missing"
                    )

        for hunt_id in hunt_ids:
            for facet in COVERAGE_FACETS:
                if (hunt_id, facet) not in coverage_keys:
                    errors.append(
                        f"manifest.coverage: missing entry for {hunt_id!r}/{facet!r}"
                    )

        observed_counts = _coverage_observed_counts(table_records, indexes)
        for (hunt_id, facet), item in coverage_entries.items():
            declared = item.get("observed")
            actual = observed_counts.get(hunt_id, {}).get(facet)
            if (
                isinstance(declared, int)
                and not isinstance(declared, bool)
                and actual is not None
                and declared != actual
            ):
                errors.append(
                    f"manifest.coverage {hunt_id!r}/{facet!r}: observed mismatch "
                    f"(manifest {declared}, actual {actual})"
                )

    source_index = indexes["sources"]
    asset_index = indexes["assets"]
    puzzle_index = indexes["puzzles"]
    group_index = indexes["groups"]

    # The manifest can cite source records as evidence for dataset-level rights.
    for path, key, value in _walk_core(manifest):
        if key != "source_ids" or not isinstance(value, list):
            continue
        for reference in value:
            if isinstance(reference, str) and reference not in source_index:
                errors.append(
                    f"manifest.json{_json_path(path)[1:]}: unknown source reference {reference!r}"
                )

    # Source, asset, puzzle, and group references nested anywhere in core fields.
    for table in TABLES:
        root_id_field = ID_FIELDS[table]
        for index, record in enumerate(table_records[table]):
            label = _record_label(table, index, record)
            owner_hunt = _owner_hunt(table, record)
            allowed_source_hunts: set[str] | None = None
            if table == "relations" and record.get("type") in CROSS_HUNT_RELATION_TYPES:
                allowed_source_hunts = {owner_hunt} if isinstance(owner_hunt, str) else set()
                for endpoint_key in ("from_id", "to_id"):
                    endpoint_id = record.get(endpoint_key)
                    endpoint_entry = records_by_id.get(endpoint_id) if isinstance(endpoint_id, str) else None
                    endpoint_hunt = endpoint_entry[1].get("hunt_id") if endpoint_entry else None
                    if isinstance(endpoint_hunt, str):
                        allowed_source_hunts.add(endpoint_hunt)
            for path, key, value in _walk_core(record):
                path_label = f"{label}{_json_path(path)[1:]}"
                if key in {"source_ids", "snapshot_source_ids"} and isinstance(value, list):
                    for reference in value:
                        if not isinstance(reference, str):
                            continue
                        target = source_index.get(reference)
                        if target is None:
                            errors.append(f"{path_label}: unknown source reference {reference!r}")
                        else:
                            _check_reference_hunt(
                                owner_hunt,
                                target,
                                reference,
                                path_label,
                                errors,
                                allowed_source_hunts,
                            )
                elif key == "source_id" and path != (root_id_field,) and isinstance(value, str):
                    target = source_index.get(value)
                    if target is None:
                        errors.append(f"{path_label}: unknown source reference {value!r}")
                    else:
                        _check_reference_hunt(
                            owner_hunt,
                            target,
                            value,
                            path_label,
                            errors,
                            allowed_source_hunts,
                        )
                elif (
                    key in {"asset_id", "bundle_asset_id", "entrypoint_asset_id"}
                    and path != (root_id_field,)
                    and isinstance(value, str)
                ):
                    target = asset_index.get(value)
                    if target is None:
                        errors.append(f"{path_label}: unknown asset reference {value!r}")
                    else:
                        _check_reference_hunt(owner_hunt, target, value, path_label, errors)
                elif key == "asset_ids" and isinstance(value, list):
                    for reference in value:
                        if not isinstance(reference, str):
                            continue
                        target = asset_index.get(reference)
                        if target is None:
                            errors.append(f"{path_label}: unknown asset reference {reference!r}")
                        else:
                            _check_reference_hunt(owner_hunt, target, reference, path_label, errors)
                elif key == "puzzle_id" and path != (root_id_field,) and isinstance(value, str):
                    target = puzzle_index.get(value)
                    if target is None:
                        errors.append(f"{path_label}: unknown puzzle reference {value!r}")
                    else:
                        _check_reference_hunt(owner_hunt, target, value, path_label, errors)
                elif key == "group_id" and path != (root_id_field,) and isinstance(value, str):
                    target = group_index.get(value)
                    if target is None:
                        errors.append(f"{path_label}: unknown group reference {value!r}")
                    else:
                        _check_reference_hunt(owner_hunt, target, value, path_label, errors)

    # Relation endpoint types, ownership, and restricted acyclic graphs.
    endpoint_types: dict[str, str] = {identifier: "puzzle" for identifier in puzzle_index}
    endpoint_types.update({identifier: "group" for identifier in group_index})
    endpoint_records: dict[str, Mapping[str, Any]] = {**puzzle_index, **group_index}
    allowed_endpoints: dict[str, tuple[set[str], set[str]]] = {
        "member_of": ({"puzzle", "group"}, {"group"}),
        "component_of": ({"puzzle"}, {"puzzle"}),
        "feeds": ({"puzzle"}, {"puzzle"}),
        "requires": ({"puzzle", "group"}, {"puzzle", "group"}),
        "unlocks": ({"puzzle", "group"}, {"puzzle", "group"}),
        "solution_reference": ({"puzzle"}, {"puzzle"}),
        "precedes": ({"puzzle", "group"}, {"puzzle", "group"}),
        "references": ({"puzzle", "group"}, {"puzzle", "group"}),
        "variant_of": ({"puzzle"}, {"puzzle"}),
        "instance_of": ({"puzzle"}, {"puzzle"}),
        "replaces": ({"puzzle"}, {"puzzle"}),
        "other": ({"puzzle", "group"}, {"puzzle", "group"}),
    }
    acyclic_edges: dict[str, list[tuple[str, str]]] = defaultdict(list)
    relation_edges: set[tuple[str, str, str]] = set()
    for index, relation in enumerate(table_records["relations"]):
        label = _record_label("relations", index, relation)
        relation_type = relation.get("type")
        from_id = relation.get("from_id")
        to_id = relation.get("to_id")
        if not isinstance(relation_type, str) or not isinstance(from_id, str) or not isinstance(to_id, str):
            continue
        if from_id == to_id:
            errors.append(f"{label}: relation endpoints must be different")
        edge_key = (relation_type, from_id, to_id)
        if edge_key in relation_edges:
            errors.append(f"{label}: duplicate {relation_type} edge from {from_id!r} to {to_id!r}")
        relation_edges.add(edge_key)
        from_type = endpoint_types.get(from_id)
        to_type = endpoint_types.get(to_id)
        if from_type is None:
            errors.append(f"{label}: unknown relation from_id {from_id!r}")
        if to_type is None:
            errors.append(f"{label}: unknown relation to_id {to_id!r}")
        endpoint_rule = allowed_endpoints.get(relation_type)
        if endpoint_rule is not None:
            allowed_from, allowed_to = endpoint_rule
            if from_type is not None and from_type not in allowed_from:
                errors.append(f"{label}: {relation_type} cannot start at a {from_type}")
            if to_type is not None and to_type not in allowed_to:
                errors.append(f"{label}: {relation_type} cannot end at a {to_type}")
        if relation_type == "feeds" and to_type == "puzzle":
            target_kind = puzzle_index[to_id].get("kind")
            if target_kind not in {"meta", "final_meta"}:
                errors.append(f"{label}: feeds must target a meta or final_meta puzzle")

        relation_hunt = relation.get("hunt_id")
        from_hunt = endpoint_records.get(from_id, {}).get("hunt_id")
        to_hunt = endpoint_records.get(to_id, {}).get("hunt_id")
        if isinstance(relation_hunt, str) and isinstance(from_hunt, str) and from_hunt != relation_hunt:
            errors.append(f"{label}: from_id belongs to hunt {from_hunt!r}, not relation hunt {relation_hunt!r}")
        if (
            relation_type not in CROSS_HUNT_RELATION_TYPES
            and isinstance(relation_hunt, str)
            and isinstance(to_hunt, str)
            and to_hunt != relation_hunt
        ):
            errors.append(f"{label}: {relation_type} cannot cross from hunt {relation_hunt!r} to {to_hunt!r}")
        if relation_type in {"member_of", "component_of", "solution_reference"}:
            acyclic_edges[relation_type].append((from_id, to_id))

    for relation_type in ("member_of", "component_of", "solution_reference"):
        cycle = _detect_cycle(acyclic_edges.get(relation_type, ()))
        if cycle:
            errors.append(f"relations.jsonl: {relation_type} graph contains a cycle: {' -> '.join(cycle)}")

    # Answer status and spoiler policy.
    for index, puzzle in enumerate(table_records["puzzles"]):
        label = _record_label("puzzles", index, puzzle)
        puzzle_id = puzzle.get("puzzle_id")
        local_ids: dict[str, tuple[Any, ...]] = {}
        content_ids: set[str] = set()
        derived_refs: list[tuple[tuple[Any, ...], str]] = []
        for path, key, value in _walk_core(puzzle):
            if key in {"content_id", "answer_id", "response_id", "hint_id"} and isinstance(value, str):
                if isinstance(puzzle_id, str) and not value.startswith(f"{puzzle_id}:"):
                    errors.append(
                        f"{label}{_json_path(path)[1:]}: local ID must start with the puzzle ID followed by ':'"
                    )
                previous = local_ids.get(value)
                if previous is not None:
                    errors.append(
                        f"{label}{_json_path(path)[1:]}: duplicate local ID {value!r} "
                        f"(first used at {_json_path(previous)})"
                    )
                else:
                    local_ids[value] = path
                if key == "content_id":
                    content_ids.add(value)
            elif key == "derived_from_content_id" and isinstance(value, str):
                derived_refs.append((path, value))
        for path, reference in derived_refs:
            if reference not in content_ids:
                errors.append(
                    f"{label}{_json_path(path)[1:]}: unknown content block {reference!r}"
                )

        status = puzzle.get("answer_status")
        answers = puzzle.get("answers")
        if isinstance(answers, list):
            final_answers = [
                answer
                for answer in answers
                if isinstance(answer, dict)
                and answer.get("kind") == "final"
                and answer.get("counts_as_solve") is True
            ]
            if status == "available" and not final_answers:
                errors.append(
                    f"{label}: answer_status 'available' requires a final answer with counts_as_solve=true"
                )
            elif status in {"missing", "not_applicable", "unknown"} and answers:
                errors.append(f"{label}: answer_status {status!r} must not include answers")

        for field, floor in (
            ("statements", 0),
            ("hints", 1),
            ("answers", 2),
            ("answer_responses", 2),
            ("solutions", 3),
            ("postsolve", 3),
            ("interactive", 0),
        ):
            if field in puzzle:
                _check_spoiler_floor(puzzle[field], floor, f"{label}.{field}", errors)
        _check_source_asset_levels(puzzle, label, errors)
        if "extensions" in puzzle:
            # Extensions are opaque, but an extension which deliberately uses the
            # core asset_refs shape still inherits the level-3 default.
            _check_spoiler_floor(puzzle["extensions"], 3, f"{label}.extensions", errors)
        interactive = puzzle.get("interactive")
        if isinstance(interactive, dict):
            if interactive.get("runnable") is True:
                runtime_asset_ids = {
                    ref.get("asset_id")
                    for ref in interactive.get("asset_refs", [])
                    if isinstance(ref, dict) and ref.get("role") == "runtime"
                }
                for asset_field in ("bundle_asset_id", "entrypoint_asset_id"):
                    asset_id = interactive.get(asset_field)
                    if not isinstance(asset_id, str):
                        continue
                    asset = asset_index.get(asset_id)
                    if asset is not None and asset.get("status") != "available":
                        errors.append(
                            f"{label}.interactive.{asset_field}: runnable interaction requires "
                            "an available local asset"
                        )
                    if asset_id not in runtime_asset_ids:
                        errors.append(
                            f"{label}.interactive.{asset_field}: runnable interaction must list "
                            "the asset in asset_refs with role 'runtime'"
                        )

    # Referenced local assets and source snapshots are immutable files.
    for index, asset in enumerate(table_records["assets"]):
        if "path" not in asset:
            continue
        label = f"{_record_label('assets', index, asset)}.path"
        if not str(asset.get("path", "")).startswith("files/"):
            errors.append(f"{label}: path must be under files/")
        path = _safe_dataset_path(root, asset.get("path"), label, errors)
        _check_integrity(path, asset.get("bytes"), asset.get("sha256"), label, errors, integrity_cache)
    for index, source in enumerate(table_records["sources"]):
        snapshot = source.get("snapshot")
        if not isinstance(snapshot, dict) or "path" not in snapshot:
            continue
        label = f"{_record_label('sources', index, source)}.snapshot.path"
        if not str(snapshot.get("path", "")).startswith("files/"):
            errors.append(f"{label}: path must be under files/")
        path = _safe_dataset_path(root, snapshot.get("path"), label, errors)
        _check_integrity(
            path,
            snapshot.get("bytes"),
            snapshot.get("sha256"),
            label,
            errors,
            integrity_cache,
        )

    return sorted(set(errors))


def validate_dataset(dataset_root: str | Path, schema_dir: str | Path | None = None) -> None:
    """Validate a dataset package, raising :class:`DatasetValidationError` on failure."""
    errors = collect_validation_errors(dataset_root, schema_dir)
    if errors:
        raise DatasetValidationError(errors)


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Validate a Puzzle Hunt Dataset v2 package")
    parser.add_argument("dataset", type=Path, help="dataset directory containing manifest.json")
    parser.add_argument(
        "--schema-dir",
        type=Path,
        default=DEFAULT_SCHEMA_DIR,
        help=f"local Draft 2020-12 schema directory (default: {DEFAULT_SCHEMA_DIR})",
    )
    return parser


def main(argv: Sequence[str] | None = None) -> int:
    args = _build_parser().parse_args(argv)
    errors = collect_validation_errors(args.dataset, args.schema_dir)
    if errors:
        print(f"INVALID: {len(errors)} error(s)", file=sys.stderr)
        for error in errors:
            print(f"- {error}", file=sys.stderr)
        return 1
    print(f"OK: {args.dataset}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
