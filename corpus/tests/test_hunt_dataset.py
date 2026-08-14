import hashlib
import json
import shutil
import sys
import tempfile
import unittest
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]
SCRIPTS = PROJECT_ROOT / "scripts"
FIXTURE = PROJECT_ROOT / "examples" / "hunt-dataset-v2"
sys.path.insert(0, str(SCRIPTS))

from validate_hunt_dataset import collect_validation_errors  # noqa: E402


def read_jsonl(path):
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line]


def write_jsonl(path, records):
    text = "".join(
        json.dumps(record, ensure_ascii=False, separators=(",", ":")) + "\n"
        for record in records
    )
    path.write_text(text, encoding="utf-8")


class HuntDatasetValidationTests(unittest.TestCase):
    def fixture_copy(self, directory):
        destination = Path(directory) / "dataset"
        shutil.copytree(FIXTURE, destination)
        return destination

    def test_multi_hunt_fixture_is_valid(self):
        self.assertEqual(collect_validation_errors(FIXTURE), [])

    def test_unknown_core_field_is_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            dataset = self.fixture_copy(directory)
            hunts_path = dataset / "hunts.jsonl"
            hunts = read_jsonl(hunts_path)
            hunts[0]["legacy_metadata"] = {"unexpected": True}
            write_jsonl(hunts_path, hunts)

            errors = collect_validation_errors(dataset)
            self.assertTrue(any("legacy_metadata" in error for error in errors), errors)

    def test_unknown_source_reference_is_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            dataset = self.fixture_copy(directory)
            puzzles_path = dataset / "puzzles.jsonl"
            puzzles = read_jsonl(puzzles_path)
            puzzles[0]["source_ids"] = ["source:missing"]
            write_jsonl(puzzles_path, puzzles)

            errors = collect_validation_errors(dataset)
            self.assertTrue(any("unknown source reference" in error for error in errors), errors)

    def test_unknown_manifest_rights_source_is_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            dataset = self.fixture_copy(directory)
            manifest_path = dataset / "manifest.json"
            manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
            manifest["rights"]["source_ids"] = ["source:missing"]
            manifest_path.write_text(
                json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
                encoding="utf-8",
            )

            errors = collect_validation_errors(dataset)
            self.assertTrue(any("unknown source reference" in error for error in errors), errors)

    def test_coverage_cannot_claim_missing_puzzles_are_complete(self):
        with tempfile.TemporaryDirectory() as directory:
            dataset = self.fixture_copy(directory)
            manifest_path = dataset / "manifest.json"
            manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
            coverage = next(
                item
                for item in manifest["coverage"]
                if item["hunt_id"] == "lantern-league.2025" and item["facet"] == "puzzles"
            )
            coverage.update(expected=2, observed=1, missing=1)
            manifest_path.write_text(
                json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
                encoding="utf-8",
            )

            errors = collect_validation_errors(dataset)
            self.assertTrue(any("observed mismatch" in error for error in errors), errors)
            self.assertTrue(any("0 was expected" in error for error in errors), errors)

    def test_table_file_names_are_fixed(self):
        with tempfile.TemporaryDirectory() as directory:
            dataset = self.fixture_copy(directory)
            renamed = dataset / "tables" / "h.jsonl"
            renamed.parent.mkdir()
            (dataset / "hunts.jsonl").rename(renamed)
            manifest_path = dataset / "manifest.json"
            manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
            manifest["files"]["hunts"]["path"] = "tables/h.jsonl"
            manifest_path.write_text(
                json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
                encoding="utf-8",
            )

            errors = collect_validation_errors(dataset)
            self.assertTrue(any("hunts.jsonl" in error and "path" in error for error in errors), errors)

    def test_solution_asset_cannot_be_downgraded_to_public(self):
        with tempfile.TemporaryDirectory() as directory:
            dataset = self.fixture_copy(directory)
            puzzles_path = dataset / "puzzles.jsonl"
            puzzles = read_jsonl(puzzles_path)
            star_map = next(record for record in puzzles if record["puzzle_id"].endswith(":star-map"))
            star_map["solutions"][0]["asset_refs"].append(
                {
                    "asset_id": "lantern-league.2025:asset:star-map",
                    "role": "inline",
                    "order": 0,
                    "required": False,
                    "spoiler_level": 0,
                }
            )
            write_jsonl(puzzles_path, puzzles)

            errors = collect_validation_errors(dataset)
            self.assertTrue(any("below the required level 3" in error for error in errors), errors)

    def test_checker_source_asset_is_solution_level(self):
        with tempfile.TemporaryDirectory() as directory:
            dataset = self.fixture_copy(directory)
            puzzles_path = dataset / "puzzles.jsonl"
            puzzles = read_jsonl(puzzles_path)
            star_map = next(record for record in puzzles if record["puzzle_id"].endswith(":star-map"))
            star_map["answers"][0]["checker"] = {
                "kind": "source",
                "asset_refs": [
                    {
                        "asset_id": "lantern-league.2025:asset:star-map",
                        "role": "source",
                        "order": 0,
                        "required": True,
                        "spoiler_level": 2,
                    }
                ],
            }
            write_jsonl(puzzles_path, puzzles)

            errors = collect_validation_errors(dataset)
            self.assertTrue(any("source asset must use spoiler_level 3" in error for error in errors), errors)

    def test_media_format_requires_an_asset(self):
        with tempfile.TemporaryDirectory() as directory:
            dataset = self.fixture_copy(directory)
            puzzles_path = dataset / "puzzles.jsonl"
            puzzles = read_jsonl(puzzles_path)
            folded_note = next(
                record for record in puzzles if record["puzzle_id"].endswith(":folded-note")
            )
            folded_note["statements"][0]["format"] = "media"
            write_jsonl(puzzles_path, puzzles)

            errors = collect_validation_errors(dataset)
            self.assertTrue(any("asset_refs" in error and "non-empty" in error for error in errors), errors)

    def test_source_only_interaction_cannot_be_runnable(self):
        with tempfile.TemporaryDirectory() as directory:
            dataset = self.fixture_copy(directory)
            puzzles_path = dataset / "puzzles.jsonl"
            puzzles = read_jsonl(puzzles_path)
            observatory = next(
                record for record in puzzles if record["puzzle_id"].endswith(":observatory")
            )
            observatory["interactive"]["mode"] = "source_only"
            write_jsonl(puzzles_path, puzzles)

            errors = collect_validation_errors(dataset)
            self.assertTrue(any("interactive.runnable" in error for error in errors), errors)

    def test_runnable_entrypoint_must_be_a_runtime_asset_ref(self):
        with tempfile.TemporaryDirectory() as directory:
            dataset = self.fixture_copy(directory)
            puzzles_path = dataset / "puzzles.jsonl"
            puzzles = read_jsonl(puzzles_path)
            observatory = next(
                record for record in puzzles if record["puzzle_id"].endswith(":observatory")
            )
            observatory["interactive"]["entrypoint_asset_id"] = (
                "lantern-league.2025:asset:star-map"
            )
            write_jsonl(puzzles_path, puzzles)

            errors = collect_validation_errors(dataset)
            self.assertTrue(
                any("entrypoint_asset_id" in error and "role 'runtime'" in error for error in errors),
                errors,
            )

    def test_cross_hunt_relation_can_cite_either_endpoint_hunt(self):
        with tempfile.TemporaryDirectory() as directory:
            dataset = self.fixture_copy(directory)
            relations_path = dataset / "relations.jsonl"
            relations = read_jsonl(relations_path)
            relation = relations[0]
            relation["type"] = "references"
            relation["to_id"] = "paper-trail.2026:puzzle:folded-note"
            relation["source_ids"] = ["paper-trail.2026:source:handout"]
            write_jsonl(relations_path, relations)

            manifest_path = dataset / "manifest.json"
            manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
            relation_bytes = relations_path.read_bytes()
            manifest["files"]["relations"]["bytes"] = len(relation_bytes)
            manifest["files"]["relations"]["sha256"] = hashlib.sha256(relation_bytes).hexdigest()
            manifest_path.write_text(
                json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
                encoding="utf-8",
            )

            errors = collect_validation_errors(dataset)
            self.assertEqual(errors, [])

    def test_malformed_mixed_timezone_dates_do_not_crash(self):
        with tempfile.TemporaryDirectory() as directory:
            dataset = self.fixture_copy(directory)
            hunts_path = dataset / "hunts.jsonl"
            hunts = read_jsonl(hunts_path)
            hunts[0]["start_at"] = "2025-01-01T00:00:00"
            hunts[0]["end_at"] = "2025-01-02T00:00:00Z"
            write_jsonl(hunts_path, hunts)

            errors = collect_validation_errors(dataset)
            self.assertTrue(any("start_at" in error and "date-time" in error for error in errors), errors)

    def test_non_rfc3339_datetime_variants_are_rejected(self):
        invalid_values = (
            "2025-01-01X00:00:00+00:00",
            "2025-01-01T00:00:00+00:00:30",
            "1990-12-31T23:59:60Z",
        )
        for invalid_value in invalid_values:
            with self.subTest(invalid_value=invalid_value), tempfile.TemporaryDirectory() as directory:
                dataset = self.fixture_copy(directory)
                hunts_path = dataset / "hunts.jsonl"
                hunts = read_jsonl(hunts_path)
                hunts[0]["start_at"] = invalid_value
                write_jsonl(hunts_path, hunts)

                errors = collect_validation_errors(dataset)
                self.assertTrue(
                    any("start_at" in error and "date-time" in error for error in errors),
                    errors,
                )

    def test_tampered_asset_is_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            dataset = self.fixture_copy(directory)
            asset = dataset / "files" / "lantern-league.2025" / "star-map.txt"
            asset.write_bytes(asset.read_bytes() + b"tampered\n")

            errors = collect_validation_errors(dataset)
            self.assertTrue(any("sha256 mismatch" in error for error in errors), errors)

    def test_self_relation_is_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            dataset = self.fixture_copy(directory)
            relations_path = dataset / "relations.jsonl"
            relations = read_jsonl(relations_path)
            relations[0]["from_id"] = relations[0]["to_id"]
            write_jsonl(relations_path, relations)

            errors = collect_validation_errors(dataset)
            self.assertTrue(any("endpoints must be different" in error for error in errors), errors)


if __name__ == "__main__":
    unittest.main()
