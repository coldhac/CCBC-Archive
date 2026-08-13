import json
import unittest
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]
PUBLIC = PROJECT_ROOT / "public"
DATA = PUBLIC / "data"


def read_json(path):
    return json.loads(path.read_text(encoding="utf-8"))


class HandbookBundleTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.manifest = read_json(DATA / "manifest.json")
        cls.catalog = read_json(DATA / "catalog.json")["records"]
        cls.relations = read_json(DATA / "relations.json")

    def test_expected_counts_are_preserved(self):
        counts = self.manifest["counts"]
        self.assertEqual(counts["records"], 1471)
        self.assertEqual(counts["hints"], 1252)
        self.assertEqual(counts["additionalAnswers"], 354)
        self.assertEqual(counts["parents"], 1019)
        self.assertEqual(counts["solutionRefs"], 513)
        self.assertEqual(counts["assets"], 1748)

    def test_all_catalog_paths_and_relations_resolve(self):
        ids = {record["id"] for record in self.catalog}
        self.assertEqual(len(ids), len(self.catalog))
        for record in self.catalog:
            self.assertTrue((PUBLIC / record["spoilerPath"]).is_file())
        for child, parent in self.relations["parents"].items():
            self.assertIn(child, ids)
            self.assertIn(parent, ids)
        for child, parent in self.relations["solutionRefs"].items():
            self.assertIn(child, ids)
            self.assertIn(parent, ids)

    def test_safe_search_contains_only_public_field(self):
        safe_docs = read_json(DATA / "search" / "safe.json")["docs"]
        hint_docs = read_json(DATA / "search" / "hints.json")["docs"]
        full_docs = read_json(DATA / "search" / "full.json")["docs"]
        self.assertTrue(all(set(doc["fields"]) == {"safe"} for doc in safe_docs))
        self.assertTrue(all(set(doc["fields"]) <= {"safe", "hints"} for doc in hint_docs))
        self.assertTrue(
            all(
                set(doc["fields"])
                <= {"safe", "hints", "answer", "additionalAnswers", "solution", "extended"}
                for doc in full_docs
            )
        )

    def test_core_shards_do_not_expose_spoiler_keys(self):
        forbidden = {"answer", "hints", "additionalAnswers", "solution", "extended", "interactive"}
        total = 0
        for event in self.manifest["events"]:
            records = read_json(DATA / "core" / f"{event['id']}.json")["records"]
            total += len(records)
            for record in records:
                self.assertFalse(forbidden & set(record))
                for asset in record.get("assets", []):
                    self.assertEqual(asset.get("contexts"), ["question"])
        self.assertEqual(total, 1471)

    def test_asset_descriptors_resolve_locally(self):
        safe_assets = read_json(DATA / "assets.safe.json")["assets"]
        for asset in safe_assets:
            self.assertTrue((PUBLIC / asset["path"]).is_file())


if __name__ == "__main__":
    unittest.main()
