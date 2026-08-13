import runpy
import tempfile
import unittest
from pathlib import Path


SCRAPER = runpy.run_path("scripts/scrape_ccbc.py")
extract_url_references = SCRAPER["extract_url_references"]
metadata_asset_text = SCRAPER["metadata_asset_text"]
looks_like_asset = SCRAPER["looks_like_asset"]
classify_record_asset_roles = SCRAPER["classify_record_asset_roles"]
atomic_write_bytes = SCRAPER["atomic_write_bytes"]
validate_raw_body = SCRAPER["validate_raw_body"]
FetchError = SCRAPER["FetchError"]
split_numbered = SCRAPER["load_historical_tieba_records"].__globals__["_split_numbered"]
split_rooms = SCRAPER["load_historical_tieba_records"].__globals__["_split_rooms"]
historical_globals = SCRAPER["load_historical_tieba_records"].__globals__


class UrlExtractionTests(unittest.TestCase):
    def test_rejects_javascript_comment_expression(self):
        self.assertEqual(
            extract_url_references("//ctx.strokeStyle", "https://archive.cipherpuzzles.com/x.yaml"),
            [],
        )

    def test_trims_chinese_sentence_punctuation(self):
        refs = extract_url_references(
            "https://nazo.one-story.cn），第一关", "https://archive.cipherpuzzles.com/x.yaml"
        )
        self.assertEqual(refs, [("https://nazo.one-story.cn", "https://nazo.one-story.cn")])

    def test_preserves_iri_path(self):
        url = "https://www.so.studiodahu.com/baike-25对色码"
        self.assertEqual(extract_url_references(url, "https://example.com/"), [(url, url)])

    def test_ignores_download_filename_but_keeps_href(self):
        url = "https://static.cipherpuzzles.com/static/images/game.exe"
        html = f'<a href="{url}" download="adventure_game.exe">下载</a>'
        self.assertEqual(extract_url_references(html, "https://archive.cipherpuzzles.com/x"), [(url, url)])

    def test_metadata_excludes_local_paths(self):
        record = {"source_metadata": {
            "dynamic_dependencies": ["/ccbc13/images/a.webp"],
            "backend_sources": [{"raw_path": "data/raw/ccbc16/script.js"}],
        }}
        values = [value for value in metadata_asset_text(record) if value]
        self.assertEqual(values, ["/ccbc13/images/a.webp"])
        self.assertFalse(any("data/raw/" in value for value in values))

    def test_archive_hash_routes_are_navigation_not_assets(self):
        url = "https://archive.cipherpuzzles.com/index.html#/problem?c=ccbc12/problems/mm"
        self.assertFalse(looks_like_asset(url))

    def test_nested_scan_ignores_bare_bundle_names(self):
        text = 'const frames=["move-01.png","H1017.7z"];'
        self.assertEqual(
            extract_url_references(
                text, "https://static.cipherpuzzles.com/static/images/x.vue",
                assets_only=True, allow_quoted_assets=False,
            ),
            [],
        )

    def test_external_media_can_be_identified_as_an_asset(self):
        self.assertTrue(looks_like_asset("https://p.sda1.dev/example/image.png"))

    def test_solution_asset_role(self):
        url = "https://p.sda1.dev/example/solution.png"
        record = {
            "question_markdown": "",
            "extended_content_markdown": "",
            "image_url": "",
            "interactive": {},
            "hints": [],
            "additional_answers": [],
            "solution_markdown": url,
            "source_url": "https://example.com/puzzle.json",
            "source_metadata": {"core_external_assets": [url]},
        }
        self.assertEqual(classify_record_asset_roles(record, {url}), {url: {"solution"}})

    def test_raw_json_validation_rejects_empty_html_and_truncation(self):
        for body in (b"", b"<!doctype html><html></html>", b'{"partial":'):
            with self.subTest(body=body):
                with self.assertRaises(FetchError):
                    validate_raw_body(body, "ccbc16/data/puzzle.json")

    def test_atomic_write_replaces_complete_file(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "raw" / "data.json"
            atomic_write_bytes(path, b'{"complete": true}')
            self.assertEqual(path.read_bytes(), b'{"complete": true}')
            self.assertEqual(list(path.parent.glob(".*.tmp")), [])

    def test_historical_numbered_split_handles_adjacent_items(self):
        self.assertEqual(
            split_numbered("3、弈4、加与减\n+--", 3, 4),
            {3: ("弈", ""), 4: ("加与减", "+--")},
        )

    def test_historical_room_split(self):
        self.assertEqual(
            split_rooms("【房间1】甲\n【房间2】乙"),
            {1: "甲", 2: "乙"},
        )

    def test_ccbc3_surviving_question_floors(self):
        self.assertEqual(historical_globals["C3_QUESTION_FLOORS"], (4, 7, 9))

    def test_ccbc3_index_official_account_is_included(self):
        self.assertIn(115104274, historical_globals["OFFICIAL_AUTHOR_IDS"])

    def test_ccbc4_room_solution_stops_before_meta(self):
        block = "16、\n答案：trilogy\n解法正文\n【第一幕meta】\nMeta 解法"
        sections = __import__("re").split(
            r"【\s*第一幕\s*meta\s*】", block, maxsplit=1, flags=__import__("re").IGNORECASE,
        )
        room_block = sections[0]
        self.assertNotIn("Meta 解法", split_numbered(room_block, 9, 16)[16][1])
        self.assertEqual(sections[1].strip(), "Meta 解法")


if __name__ == "__main__":
    unittest.main()
