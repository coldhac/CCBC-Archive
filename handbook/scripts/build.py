#!/usr/bin/env python3
"""Build the offline, spoiler-aware CCBC handbook data bundle."""

from __future__ import annotations

import argparse
import hashlib
import html
import json
import os
import re
import shutil
import tempfile
import unicodedata
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable
from urllib.parse import unquote, urlparse

try:
    import markdown as markdown_lib
    from bs4 import BeautifulSoup, Comment
except ImportError as exc:  # pragma: no cover - exercised only in an unprepared environment
    raise SystemExit(
        "Missing build dependencies. Install the handbook project requirements first: "
        "python -m pip install -r requirements.txt"
    ) from exc


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_CORPUS_ROOT = PROJECT_ROOT.parent / "corpus"
DEFAULT_OUTPUT = PROJECT_ROOT / "public/data"
DATASET_SCHEMA_VERSION = "1.0"
HANDBOOK_SCHEMA_VERSION = "1.0"

ALLOWED_TAGS = {
    "a",
    "audio",
    "b",
    "blockquote",
    "br",
    "caption",
    "code",
    "col",
    "colgroup",
    "details",
    "div",
    "em",
    "figcaption",
    "figure",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "hr",
    "i",
    "img",
    "li",
    "ol",
    "p",
    "pre",
    "s",
    "section",
    "source",
    "span",
    "strike",
    "strong",
    "sub",
    "summary",
    "sup",
    "table",
    "tbody",
    "td",
    "tfoot",
    "th",
    "thead",
    "tr",
    "u",
    "ul",
    "video",
}
DROP_WITH_CONTENT = {
    "base",
    "canvas",
    "embed",
    "iframe",
    "link",
    "math",
    "meta",
    "object",
    "option",
    "script",
    "select",
    "style",
    "svg",
    "template",
}

# These controls are inert in the handbook, but their text often carries
# official story or checkpoint content. Unwrap them instead of discarding it.
UNWRAP_WITH_CONTENT = {"button", "form", "input", "select", "textarea"}
ALLOWED_ATTRIBUTES = {
    "a": {"href", "title"},
    "audio": {"controls", "preload", "src"},
    "col": {"span", "width"},
    "details": {"open"},
    "img": {"alt", "height", "src", "title", "width"},
    "ol": {"start"},
    "source": {"src", "type"},
    "td": {"colspan", "rowspan"},
    "th": {"colspan", "rowspan"},
    "video": {"controls", "height", "poster", "preload", "src", "width"},
}
RESOURCE_ATTRIBUTES = {"src", "poster"}
BOOLEAN_ATTRIBUTES = {"controls", "open"}
DIMENSION_RE = re.compile(r"^[0-9]{1,5}(?:\.[0-9]+)?%?$")
INTEGER_RE = re.compile(r"^[0-9]{1,5}$")
SAFE_EVENT_RE = re.compile(r"^[a-z0-9][a-z0-9-]*$")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--corpus-root",
        type=Path,
        default=DEFAULT_CORPUS_ROOT,
        help="Corpus project root. Defaults to the sibling ../corpus project.",
    )
    parser.add_argument(
        "--records",
        type=Path,
        help="Override the normalized records JSONL path.",
    )
    parser.add_argument(
        "--assets",
        type=Path,
        help="Override the asset catalog JSONL path.",
    )
    parser.add_argument(
        "--asset-root",
        type=Path,
        help="Root used to resolve local_path values in assets.jsonl. Defaults to --corpus-root.",
    )
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument(
        "--asset-mode",
        choices=("hardlink", "copy"),
        default="copy",
        help="How to materialize assets in public/data/assets. Copy keeps both projects independent.",
    )
    parser.add_argument(
        "--skip-asset-hash-check",
        action="store_true",
        help="Validate asset sizes but trust recorded SHA-256 values.",
    )
    return parser.parse_args()


def read_jsonl(path: Path) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    with path.open("r", encoding="utf-8-sig") as handle:
        for line_number, line in enumerate(handle, 1):
            if not line.strip():
                continue
            try:
                value = json.loads(line)
            except json.JSONDecodeError as exc:
                raise ValueError(f"Invalid JSON in {path}:{line_number}: {exc}") from exc
            if not isinstance(value, dict):
                raise ValueError(f"Expected an object in {path}:{line_number}")
            rows.append(value)
    return rows


def write_json(path: Path, value: Any, *, pretty: bool = False) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="\n") as handle:
        json.dump(
            value,
            handle,
            ensure_ascii=False,
            indent=2 if pretty else None,
            separators=None if pretty else (",", ":"),
            sort_keys=False,
        )
        handle.write("\n")


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def stable_asset_id(url: str) -> str:
    return "asset-" + hashlib.sha256(url.encode("utf-8")).hexdigest()[:24]


def stable_spoiler_filename(record_id: str) -> str:
    return hashlib.sha256(record_id.encode("utf-8")).hexdigest()[:24] + ".json"


def normalized_url_path(value: str) -> str:
    value = html.unescape(value.strip())
    if value.startswith("//"):
        value = "https:" + value
    parsed = urlparse(value)
    path = parsed.path if parsed.scheme or parsed.netloc else value.split("?", 1)[0].split("#", 1)[0]
    path = re.sub(r"/{2,}", "/", unquote(path))
    if not path.startswith("/"):
        path = "/" + path.lstrip("./")
    return path


class AssetResolver:
    def __init__(self, assets: list[dict[str, Any]]) -> None:
        self.assets_by_id: dict[str, dict[str, Any]] = {}
        self.by_url: dict[str, str] = {}
        path_candidates: dict[str, set[str]] = defaultdict(set)
        basename_candidates: dict[str, set[str]] = defaultdict(set)
        self.official_hosts: set[str] = set()

        for source in assets:
            url = str(source.get("url", ""))
            local_path = str(source.get("local_path", ""))
            if not url or not local_path:
                raise ValueError("Every asset must have url and local_path")
            asset_id = stable_asset_id(url)
            if asset_id in self.assets_by_id:
                raise ValueError(f"Asset id collision for {url}")
            relative = Path(local_path).relative_to("data/assets").as_posix()
            public_path = "data/assets/" + relative
            asset = {
                "id": asset_id,
                "url": url,
                "path": public_path,
                "mime": source.get("media_type", "application/octet-stream"),
                "size": int(source.get("size", 0)),
                "sha256": source.get("sha256", ""),
                "status": source.get("status", ""),
                "error": source.get("error", ""),
                "sourcePath": local_path,
                "relativePath": relative,
            }
            self.assets_by_id[asset_id] = asset
            self.by_url[url] = asset_id
            parsed = urlparse(url)
            self.official_hosts.add(parsed.netloc.lower())
            path = normalized_url_path(url)
            path_candidates[path].add(asset_id)
            basename_candidates[Path(path).name].add(asset_id)

        self.by_path = {
            key: next(iter(values))
            for key, values in path_candidates.items()
            if len(values) == 1
        }
        self.by_basename = {
            key: next(iter(values))
            for key, values in basename_candidates.items()
            if key and len(values) == 1
        }

    def resolve(self, value: str, record_assets: Iterable[dict[str, Any]] = ()) -> str | None:
        candidate = html.unescape(str(value).strip())
        if not candidate:
            return None
        if candidate.startswith("//"):
            candidate = "https:" + candidate
        if candidate in self.by_url:
            return self.by_url[candidate]

        path = normalized_url_path(candidate)
        record_matches: set[str] = set()
        basename = Path(path).name
        for edge in record_assets:
            asset_id = edge["id"]
            asset = self.assets_by_id[asset_id]
            if path == normalized_url_path(asset["url"]):
                record_matches.add(asset_id)
            elif basename and basename == Path(normalized_url_path(asset["url"])).name:
                record_matches.add(asset_id)
        if len(record_matches) == 1:
            return next(iter(record_matches))
        if path in self.by_path:
            return self.by_path[path]
        return self.by_basename.get(basename)

    def public(self, asset_id: str) -> dict[str, Any]:
        asset = self.assets_by_id[asset_id]
        return {key: value for key, value in asset.items() if key not in {"sourcePath", "relativePath"}}


class HtmlRenderer:
    def __init__(self, resolver: AssetResolver) -> None:
        self.resolver = resolver
        self.stats: Counter[str] = Counter()

    def render(
        self,
        markdown_source: str,
        record_assets: list[dict[str, Any]],
    ) -> tuple[str, set[str], str]:
        if not markdown_source:
            return "", set(), ""
        raw_html = markdown_lib.markdown(
            markdown_source,
            extensions=("fenced_code", "sane_lists", "tables"),
            output_format="html5",
        )
        soup = BeautifulSoup(raw_html, "html.parser")
        used_assets: set[str] = set()

        for comment in soup.find_all(string=lambda item: isinstance(item, Comment)):
            comment.extract()
            self.stats["commentsRemoved"] += 1

        for tag in list(soup.find_all(True)):
            if tag.name is None:
                continue
            name = tag.name.lower()
            if name in DROP_WITH_CONTENT:
                tag.decompose()
                self.stats["dangerousTagsRemoved"] += 1
                continue
            if name in UNWRAP_WITH_CONTENT:
                if name == "input":
                    value = str(tag.get("value", "")).strip()
                    if value:
                        tag.replace_with(value)
                    else:
                        tag.decompose()
                else:
                    tag.unwrap()
                self.stats["interactiveTagsUnwrapped"] += 1
                continue
            if name not in ALLOWED_TAGS:
                tag.unwrap()
                self.stats["unknownTagsUnwrapped"] += 1
                continue

            allowed = ALLOWED_ATTRIBUTES.get(name, set())
            original_attributes = dict(tag.attrs)
            tag.attrs = {}
            for attribute, raw_value in original_attributes.items():
                attribute = attribute.lower()
                if attribute not in allowed:
                    self.stats["attributesRemoved"] += 1
                    continue
                value = " ".join(raw_value) if isinstance(raw_value, list) else str(raw_value)
                if attribute in BOOLEAN_ATTRIBUTES:
                    tag.attrs[attribute] = attribute
                elif attribute in RESOURCE_ATTRIBUTES:
                    asset_id = self.resolver.resolve(value, record_assets)
                    if asset_id:
                        tag.attrs[attribute] = self.resolver.assets_by_id[asset_id]["path"]
                        tag.attrs["data-asset-id"] = asset_id
                        used_assets.add(asset_id)
                        self.stats["resourceUrlsRewritten"] += 1
                    else:
                        self.stats["resourceUrlsRemoved"] += 1
                elif attribute == "href":
                    asset_id = self.resolver.resolve(value, record_assets)
                    if asset_id:
                        tag.attrs[attribute] = self.resolver.assets_by_id[asset_id]["path"]
                        tag.attrs["data-asset-id"] = asset_id
                        used_assets.add(asset_id)
                        self.stats["resourceUrlsRewritten"] += 1
                    elif self._safe_link(value):
                        tag.attrs[attribute] = value
                        if value.startswith(("http://", "https://")):
                            tag.attrs["rel"] = "noopener noreferrer"
                    else:
                        self.stats["unsafeLinksRemoved"] += 1
                elif attribute in {"height", "width"} and DIMENSION_RE.fullmatch(value):
                    tag.attrs[attribute] = value
                elif attribute in {"colspan", "rowspan", "span", "start"} and INTEGER_RE.fullmatch(value):
                    tag.attrs[attribute] = value
                elif attribute == "preload" and value in {"none", "metadata", "auto"}:
                    tag.attrs[attribute] = value
                elif attribute == "type":
                    tag.attrs[attribute] = value[:100]
                elif attribute in {"alt", "title"}:
                    tag.attrs[attribute] = value[:1000]

        rendered = str(soup)
        text = soup.get_text(" ", strip=True)
        self._validate(rendered)
        return rendered, used_assets, text

    @staticmethod
    def _safe_link(value: str) -> bool:
        value = value.strip()
        if value.startswith("#"):
            return True
        scheme = urlparse(value).scheme.lower()
        return scheme in {"http", "https", "mailto"}

    @staticmethod
    def _validate(rendered: str) -> None:
        soup = BeautifulSoup(rendered, "html.parser")
        for tag in soup.find_all(True):
            if tag.name not in ALLOWED_TAGS:
                raise ValueError(f"Sanitizer emitted disallowed tag <{tag.name}>")
            for attribute, value in tag.attrs.items():
                if attribute.startswith("on") or attribute in {"class", "id", "style", "srcset"}:
                    raise ValueError(f"Sanitizer emitted disallowed attribute {attribute}")
                joined = " ".join(value) if isinstance(value, list) else str(value)
                if joined.strip().lower().startswith(("javascript:", "data:", "file:", "blob:")):
                    raise ValueError(f"Sanitizer emitted unsafe URL in {attribute}")


def normalized_search_text(parts: Iterable[Any]) -> str:
    values: list[str] = []
    for part in parts:
        if part is None:
            continue
        if isinstance(part, (dict, list)):
            part = json.dumps(part, ensure_ascii=False, sort_keys=True)
        value = unicodedata.normalize("NFKC", str(part))
        value = re.sub(r"\s+", " ", value).strip()
        if value:
            values.append(value)
    return "\n".join(values)


def public_asset_edge(asset: dict[str, Any], contexts: set[str], roles: list[str]) -> dict[str, Any]:
    return {
        "id": asset["id"],
        "url": asset["url"],
        "path": asset["path"],
        "mime": asset["mime"],
        "size": asset["size"],
        "sha256": asset["sha256"],
        "status": asset["status"],
        "error": asset["error"],
        "roles": sorted(set(roles)),
        "contexts": sorted(contexts),
    }


def mention_contexts(
    record: dict[str, Any],
    record_assets: list[dict[str, Any]],
    context_sources: dict[str, str],
) -> dict[str, set[str]]:
    contexts: dict[str, set[str]] = defaultdict(set)
    for edge in record_assets:
        asset = edge["asset"]
        url = asset["url"]
        path = normalized_url_path(url)
        basename = Path(path).name
        needles = {url, path, html.unescape(url), unquote(path)}
        if basename:
            needles.add(basename)
        for context, source in context_sources.items():
            if source and any(needle and needle in source for needle in needles):
                contexts[asset["id"]].add(context)
    return contexts


def validate_source(records: list[dict[str, Any]], assets: list[dict[str, Any]]) -> dict[str, int]:
    record_ids = [record.get("record_id") for record in records]
    if any(not isinstance(value, str) or not value for value in record_ids):
        raise ValueError("Every record must have a non-empty record_id")
    duplicates = [key for key, count in Counter(record_ids).items() if count > 1]
    if duplicates:
        raise ValueError(f"Duplicate record ids: {duplicates[:5]}")
    id_set = set(record_ids)

    parent_count = 0
    solution_ref_count = 0
    for record in records:
        if record.get("schema_version") != DATASET_SCHEMA_VERSION:
            raise ValueError(f"Unsupported record schema on {record['record_id']}")
        parent_id = record.get("parent_id")
        if parent_id:
            parent_count += 1
            if parent_id not in id_set or parent_id == record["record_id"]:
                raise ValueError(f"Invalid parent on {record['record_id']}: {parent_id}")
        solution_ref = record.get("source_metadata", {}).get("solution_reference_record_id")
        if solution_ref:
            solution_ref_count += 1
            if solution_ref not in id_set or solution_ref == record["record_id"]:
                raise ValueError(f"Invalid solution reference on {record['record_id']}: {solution_ref}")

    asset_urls = [asset.get("url") for asset in assets]
    asset_paths = [asset.get("local_path") for asset in assets]
    if len(asset_urls) != len(set(asset_urls)) or len(asset_paths) != len(set(asset_paths)):
        raise ValueError("Asset URLs and local paths must be unique")

    hint_count = sum(len(record.get("hints", [])) for record in records)
    additional_count = sum(len(record.get("additional_answers", [])) for record in records)
    return {
        "records": len(records),
        "hints": hint_count,
        "additionalAnswers": additional_count,
        "parents": parent_count,
        "solutionRefs": solution_ref_count,
        "assets": len(assets),
    }


def validate_asset_files(
    resolver: AssetResolver,
    source_root: Path,
    *,
    check_hashes: bool,
) -> dict[str, int]:
    checked_bytes = 0
    for asset in resolver.assets_by_id.values():
        source_path = resolve_source_path(source_root, asset["sourcePath"])
        if not source_path.is_file():
            raise FileNotFoundError(f"Missing asset: {source_path}")
        actual_size = source_path.stat().st_size
        if actual_size != asset["size"]:
            raise ValueError(
                f"Asset size mismatch for {source_path}: expected {asset['size']}, got {actual_size}"
            )
        if check_hashes and sha256_file(source_path) != asset["sha256"]:
            raise ValueError(f"Asset SHA-256 mismatch for {source_path}")
        checked_bytes += actual_size
    return {"assetFiles": len(resolver.assets_by_id), "assetBytes": checked_bytes}


def resolve_source_path(source_root: Path, relative_path: str) -> Path:
    source_root = source_root.resolve()
    candidate = (source_root / relative_path).resolve()
    if candidate == source_root or source_root not in candidate.parents:
        raise ValueError(f"Asset path escapes source root: {relative_path}")
    return candidate


def materialize_assets(
    resolver: AssetResolver,
    output: Path,
    mode: str,
    source_root: Path,
) -> None:
    asset_root = output / "assets"
    for asset in resolver.assets_by_id.values():
        source = resolve_source_path(source_root, asset["sourcePath"])
        destination = asset_root / asset["relativePath"]
        destination.parent.mkdir(parents=True, exist_ok=True)
        if mode == "hardlink":
            try:
                os.link(source, destination)
                continue
            except OSError:
                pass
        shutil.copy2(source, destination)


def build_bundle(
    records: list[dict[str, Any]],
    resolver: AssetResolver,
    output: Path,
    source_counts: dict[str, int],
    asset_validation: dict[str, int],
    asset_mode: str,
    asset_source_root: Path,
) -> dict[str, Any]:
    renderer = HtmlRenderer(resolver)
    records_by_event: dict[str, list[dict[str, Any]]] = defaultdict(list)
    catalog_records: list[dict[str, Any]] = []
    safe_docs: list[dict[str, Any]] = []
    hint_docs: list[dict[str, Any]] = []
    full_docs: list[dict[str, Any]] = []
    safe_assets: dict[str, dict[str, Any]] = {}
    parent_map: dict[str, str] = {}
    solution_ref_map: dict[str, str] = {}
    child_map: dict[str, list[str]] = defaultdict(list)
    retained_asset_ids: set[str] = set()
    output_counts: Counter[str] = Counter()

    for record in records:
        record_id = record["record_id"]
        event_id = record["event_id"]
        if not SAFE_EVENT_RE.fullmatch(event_id):
            raise ValueError(f"Unsafe event id: {event_id}")

        source_edges: list[dict[str, Any]] = []
        for raw_asset in record.get("assets", []):
            asset_id = resolver.resolve(raw_asset.get("url", ""))
            if not asset_id:
                raise ValueError(f"Unresolvable asset on {record_id}: {raw_asset.get('url')}")
            source_edges.append(
                {
                    "id": asset_id,
                    "asset": resolver.assets_by_id[asset_id],
                    "roles": list(raw_asset.get("roles", [])),
                }
            )

        question_html, question_assets, question_rendered_text = renderer.render(
            record.get("question_markdown", ""), source_edges
        )
        if record.get("image_url"):
            primary_asset_id = resolver.resolve(record["image_url"], source_edges)
            if primary_asset_id:
                question_assets.add(primary_asset_id)
            else:
                primary_asset_id = None
        else:
            primary_asset_id = None

        hints: list[dict[str, Any]] = []
        hint_asset_sets: list[set[str]] = []
        hint_search_parts: list[str] = []
        for hint in record.get("hints", []):
            hint_html, asset_ids, rendered_text = renderer.render(
                hint.get("markdown", "") or hint.get("text", ""), source_edges
            )
            hint_text = hint.get("text", "") or rendered_text
            hints.append(
                {
                    "number": hint.get("number"),
                    "title": hint.get("title", ""),
                    "html": hint_html,
                    "text": hint_text,
                    "assetIds": sorted(asset_ids),
                }
            )
            hint_asset_sets.append(asset_ids)
            hint_search_parts.extend((hint.get("title", ""), hint_text))

        additional_answers: list[dict[str, Any]] = []
        additional_asset_ids: set[str] = set()
        additional_search_parts: list[str] = []
        for additional in record.get("additional_answers", []):
            message_html, message_assets, message_text = renderer.render(
                additional.get("message", ""), source_edges
            )
            extra_html, extra_assets, extra_text = renderer.render(
                additional.get("extra", ""), source_edges
            )
            additional_asset_ids.update(message_assets)
            additional_asset_ids.update(extra_assets)
            additional_answers.append(
                {
                    "answer": additional.get("answer", ""),
                    "messageHtml": message_html,
                    "messageText": message_text,
                    "extraHtml": extra_html,
                    "extraText": extra_text,
                    "assetIds": sorted(message_assets | extra_assets),
                }
            )
            additional_search_parts.extend(
                (additional.get("answer", ""), message_text, extra_text)
            )

        solution_html, solution_assets, solution_rendered_text = renderer.render(
            record.get("solution_markdown", "") or record.get("solution_text", ""),
            source_edges,
        )
        extended_html, extended_assets, extended_rendered_text = renderer.render(
            record.get("extended_content_markdown", "")
            or record.get("extended_content_text", ""),
            source_edges,
        )

        interactive_string = json.dumps(record.get("interactive", {}), ensure_ascii=False)
        metadata_string = json.dumps(record.get("source_metadata", {}), ensure_ascii=False)
        mention_sources = {
            "interactive": interactive_string,
            "sourceMetadata": metadata_string,
        }
        mentioned = mention_contexts(record, source_edges, mention_sources)

        contexts: dict[str, set[str]] = defaultdict(set)
        for asset_id in question_assets:
            contexts[asset_id].add("question")
        for index, asset_ids in enumerate(hint_asset_sets, 1):
            for asset_id in asset_ids:
                contexts[asset_id].add(f"hint:{index}")
        for asset_id in additional_asset_ids:
            contexts[asset_id].add("additionalAnswer")
        for asset_id in solution_assets:
            contexts[asset_id].add("solution")
        for asset_id in extended_assets:
            contexts[asset_id].add("extended")
        for asset_id, values in mentioned.items():
            contexts[asset_id].update(values)

        for edge in source_edges:
            asset_id = edge["id"]
            roles = set(edge["roles"])
            if "solution" in roles:
                contexts[asset_id].add("solution")
            if not contexts[asset_id]:
                contexts[asset_id].add("archive")

        safe_asset_edges: list[dict[str, Any]] = []
        spoiler_asset_edges: list[dict[str, Any]] = []
        for edge in source_edges:
            asset_id = edge["id"]
            retained_asset_ids.add(asset_id)
            if "question" in contexts[asset_id]:
                safe_asset_edges.append(
                    public_asset_edge(edge["asset"], {"question"}, edge["roles"])
                )
                safe_assets[asset_id] = resolver.public(asset_id)
            spoiler_contexts = contexts[asset_id] - {"question"}
            if spoiler_contexts:
                spoiler_asset_edges.append(
                    public_asset_edge(edge["asset"], spoiler_contexts, edge["roles"])
                )

        solution_ref_id = record.get("source_metadata", {}).get(
            "solution_reference_record_id"
        )
        parent_id = record.get("parent_id")
        root_id = parent_id or record_id
        if parent_id:
            parent_map[record_id] = parent_id
            child_map[parent_id].append(record_id)
        if solution_ref_id:
            solution_ref_map[record_id] = solution_ref_id

        quality = dict(record.get("quality", {}))
        core_record = {
            "id": record_id,
            "schemaVersion": HANDBOOK_SCHEMA_VERSION,
            "eventId": event_id,
            "editions": record.get("editions", []),
            "edition": ", ".join(record.get("editions", [])),
            "year": record.get("year"),
            "area": record.get("area", ""),
            "kind": record.get("kind", "puzzle"),
            "sourceId": record.get("source_id", ""),
            "title": record.get("title", ""),
            "authors": record.get("authors", []),
            "parentId": parent_id,
            "solutionRefId": solution_ref_id,
            "rootId": root_id,
            "contentStatus": record.get("content_status", ""),
            "contentFormat": record.get("content_format", ""),
            "solutionStatus": record.get("solution_status", ""),
            "solutionFormat": record.get("solution_format", ""),
            "questionHtml": question_html,
            "questionText": record.get("question_text", "") or question_rendered_text,
            "primaryAssetId": primary_asset_id,
            "assets": sorted(safe_asset_edges, key=lambda item: item["id"]),
            "availability": {
                "hasAnswer": bool(quality.get("has_answer")),
                "hintCount": len(hints),
                "additionalAnswerCount": len(additional_answers),
                "hasSolution": bool(quality.get("has_solution")),
                "hasSolutionReference": bool(quality.get("has_solution_reference")),
                "hasExtended": bool(
                    record.get("extended_content_markdown")
                    or record.get("extended_content_text")
                ),
                "hasInteractive": bool(record.get("interactive")),
                "failedAssetCount": len(record.get("failed_assets", [])),
            },
            "quality": quality,
            "provenance": {
                "sourceUrl": record.get("source_url", ""),
                "rawPath": record.get("raw_path", ""),
                "markdownPath": record.get("markdown_path", ""),
                "fetchedAt": record.get("fetched_at", ""),
            },
        }
        records_by_event[event_id].append(core_record)

        spoiler_filename = stable_spoiler_filename(record_id)
        spoiler_path = f"data/spoilers/{spoiler_filename}"
        spoiler = {
            "id": record_id,
            "answer": record.get("answer", ""),
            "hints": hints,
            "additionalAnswers": additional_answers,
            "solution": {
                "status": record.get("solution_status", ""),
                "format": record.get("solution_format", ""),
                "html": solution_html,
                "text": record.get("solution_text", "") or solution_rendered_text,
                "refId": solution_ref_id,
                "assetIds": sorted(solution_assets),
            },
            "extended": {
                "html": extended_html,
                "text": record.get("extended_content_text", "") or extended_rendered_text,
                "assetIds": sorted(extended_assets),
            },
            "interactive": record.get("interactive", {}),
            "sourceMetadata": record.get("source_metadata", {}),
            "failedAssets": record.get("failed_assets", []),
            "assets": sorted(spoiler_asset_edges, key=lambda item: item["id"]),
        }
        write_json(output / "spoilers" / spoiler_filename, spoiler)

        catalog_record = {
            "id": record_id,
            "eventId": event_id,
            "edition": ", ".join(record.get("editions", [])),
            "year": record.get("year"),
            "area": record.get("area", ""),
            "kind": record.get("kind", "puzzle"),
            "title": record.get("title", ""),
            "authors": record.get("authors", []),
            "parentId": parent_id,
            "contentStatus": record.get("content_status", ""),
            "contentFormat": record.get("content_format", ""),
            "solutionStatus": record.get("solution_status", ""),
            "hintCount": len(hints),
            "additionalAnswerCount": len(additional_answers),
            "hasAnswer": bool(quality.get("has_answer")),
            "hasSolution": bool(quality.get("has_solution")),
            "hasExtended": core_record["availability"]["hasExtended"],
            "hasInteractive": core_record["availability"]["hasInteractive"],
            "assetCount": len(record.get("assets", [])),
            "rootId": root_id,
            "spoilerPath": spoiler_path,
        }
        catalog_records.append(catalog_record)

        safe_parts = (
            record.get("title", ""),
            record.get("editions", []),
            record.get("area", ""),
            record.get("authors", []),
            record.get("question_text", "") or question_rendered_text,
        )
        safe_text = normalized_search_text(safe_parts)
        hint_text = normalized_search_text(hint_search_parts)
        answer_text = normalized_search_text((record.get("answer", ""),))
        additional_text = normalized_search_text(additional_search_parts)
        solution_text = normalized_search_text(
            (record.get("solution_text", "") or solution_rendered_text,)
        )
        extended_text = normalized_search_text(
            (record.get("extended_content_text", "") or extended_rendered_text,)
        )
        doc_base = {
            "id": record_id,
            "rootId": root_id,
            "eventId": event_id,
            "kind": record.get("kind", "puzzle"),
            "title": record.get("title", ""),
            # Search snippets always come from the public question, even when a
            # protected field caused the match.
            "snippetText": normalized_search_text(
                (record.get("question_text", "") or question_rendered_text,)
            ),
        }
        safe_docs.append(
            {**doc_base, "text": safe_text, "fields": {"safe": safe_text}}
        )
        hint_docs.append(
            {
                **doc_base,
                "text": safe_text,
                "fields": {"safe": safe_text, "hints": hint_text},
            }
        )
        full_docs.append(
            {
                **doc_base,
                "text": safe_text,
                "fields": {
                    "safe": safe_text,
                    "hints": hint_text,
                    "answer": answer_text,
                    "additionalAnswers": additional_text,
                    "solution": solution_text,
                    "extended": extended_text,
                },
            }
        )

        output_counts["records"] += 1
        output_counts["hints"] += len(hints)
        output_counts["additionalAnswers"] += len(additional_answers)

    missing_assets = set(resolver.assets_by_id) - retained_asset_ids
    if missing_assets:
        raise ValueError(f"Assets not retained by any record: {sorted(missing_assets)[:5]}")

    catalog_records.sort(key=lambda item: (item["year"] or 0, item["eventId"], item["id"]))
    for event_records in records_by_event.values():
        event_records.sort(key=lambda item: item["id"])
    for children in child_map.values():
        children.sort()

    write_json(output / "catalog.json", {"records": catalog_records})
    write_json(
        output / "relations.json",
        {
            "parents": dict(sorted(parent_map.items())),
            "solutionRefs": dict(sorted(solution_ref_map.items())),
            "children": dict(sorted(child_map.items())),
        },
    )
    for event_id, event_records in sorted(records_by_event.items()):
        write_json(output / "core" / f"{event_id}.json", {"records": event_records})
    write_json(output / "search/safe.json", {"docs": safe_docs})
    write_json(output / "search/hints.json", {"docs": hint_docs})
    write_json(output / "search/full.json", {"docs": full_docs})
    write_json(
        output / "assets.safe.json",
        {"assets": sorted(safe_assets.values(), key=lambda item: item["id"])},
    )

    if dict(output_counts) != {
        key: source_counts[key] for key in ("records", "hints", "additionalAnswers")
    }:
        raise ValueError(f"Output count mismatch: source={source_counts}, output={dict(output_counts)}")
    if len(parent_map) != source_counts["parents"]:
        raise ValueError("Parent relation count changed during build")
    if len(solution_ref_map) != source_counts["solutionRefs"]:
        raise ValueError("Solution reference count changed during build")

    materialize_assets(resolver, output, asset_mode, asset_source_root)

    data_files: dict[str, dict[str, Any]] = {}
    tracked_files = [
        output / "catalog.json",
        output / "relations.json",
        output / "assets.safe.json",
        output / "search/safe.json",
        output / "search/hints.json",
        output / "search/full.json",
        *(output / "core" / f"{event_id}.json" for event_id in sorted(records_by_event)),
    ]
    for path in tracked_files:
        relative = path.relative_to(output).as_posix()
        data_files[relative] = {"bytes": path.stat().st_size, "sha256": sha256_file(path)}

    manifest = {
        "schemaVersion": HANDBOOK_SCHEMA_VERSION,
        "sourceSchemaVersion": DATASET_SCHEMA_VERSION,
        "builtAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "paths": {
            "catalog": "data/catalog.json",
            "relations": "data/relations.json",
            "assetsSafe": "data/assets.safe.json",
            "core": {
                event_id: f"data/core/{event_id}.json"
                for event_id in sorted(records_by_event)
            },
            "search": {
                "safe": "data/search/safe.json",
                "hints": "data/search/hints.json",
                "full": "data/search/full.json",
            },
            "spoilers": "data/spoilers/",
            "assets": "data/assets/",
        },
        "counts": {
            **source_counts,
            **asset_validation,
            "events": len(records_by_event),
            "coreRecords": sum(len(items) for items in records_by_event.values()),
            "catalogRecords": len(catalog_records),
            "spoilerFiles": len(catalog_records),
            "safeSearchDocs": len(safe_docs),
            "hintSearchDocs": len(hint_docs),
            "fullSearchDocs": len(full_docs),
            "safeAssets": len(safe_assets),
            "retainedAssets": len(retained_asset_ids),
        },
        "events": [
            {
                "id": event_id,
                "path": f"data/core/{event_id}.json",
                "records": len(records_by_event[event_id]),
            }
            for event_id in sorted(records_by_event)
        ],
        "search": {
            "tiersAreCumulative": True,
            "safeExcludes": [
                "answer",
                "hints",
                "additionalAnswers",
                "solution",
                "extended",
                "interactive",
                "sourceMetadata",
            ],
        },
        "sanitizer": dict(sorted(renderer.stats.items())),
        "assetMode": asset_mode,
        "files": data_files,
    }
    write_json(output / "manifest.json", manifest, pretty=True)
    return manifest


def install_output(staging: Path, destination: Path) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    if destination.exists() or destination.is_symlink():
        if destination.is_symlink() or destination.is_file():
            destination.unlink()
        else:
            shutil.rmtree(destination)
    os.replace(staging, destination)


def main() -> int:
    args = parse_args()
    corpus_root = args.corpus_root.resolve()
    records_path = (args.records or corpus_root / "data/processed/records.jsonl").resolve()
    assets_path = (args.assets or corpus_root / "data/processed/assets.jsonl").resolve()
    asset_source_root = (args.asset_root or corpus_root).resolve()
    output_path = args.output.resolve()
    public_root = (PROJECT_ROOT / "public").resolve()
    if output_path == public_root or public_root not in output_path.parents:
        raise SystemExit(f"Refusing to replace output outside a public subdirectory: {output_path}")

    records = read_jsonl(records_path)
    assets = read_jsonl(assets_path)
    source_counts = validate_source(records, assets)
    resolver = AssetResolver(assets)
    asset_validation = validate_asset_files(
        resolver,
        asset_source_root,
        check_hashes=not args.skip_asset_hash_check,
    )

    output_path.parent.mkdir(parents=True, exist_ok=True)
    staging = Path(tempfile.mkdtemp(prefix=".handbook-data-", dir=output_path.parent))
    try:
        manifest = build_bundle(
            records,
            resolver,
            staging,
            source_counts,
            asset_validation,
            args.asset_mode,
            asset_source_root,
        )
        install_output(staging, output_path)
    except Exception:
        shutil.rmtree(staging, ignore_errors=True)
        raise

    summary = {
        "output": str(output_path),
        "counts": manifest["counts"],
        "sanitizer": manifest["sanitizer"],
    }
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
