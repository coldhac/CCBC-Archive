#!/usr/bin/env python3
"""Build a reproducible, normalized corpus from the public CCBC archives."""

from __future__ import annotations

import argparse
import csv
import hashlib
import html
import json
import mimetypes
import os
import re
import shutil
import sys
import threading
import time
import xml.etree.ElementTree as ET
from collections import Counter, defaultdict, deque
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path, PurePosixPath
from typing import Any, Iterable
from urllib.parse import unquote, urljoin, urlparse, urlunparse
from xml.sax.saxutils import unescape as xml_unescape

import markdown
import requests
import yaml
from bs4 import BeautifulSoup

try:
    from tieba_history import load_historical_tieba_records
except ImportError:  # Imported through runpy/tests from the repository root.
    from scripts.tieba_history import load_historical_tieba_records


ARCHIVE_ROOT = "https://archive.cipherpuzzles.com/"
C16_ROOT = "https://ccbc16.cipherpuzzles.com/"
C12_ARCHIVE_COMMIT = "991d9ec62e9df48aee6486aa1727f3a492a80cc0"
C12_COMPONENTS = {
    "LightGame": {
        "parent_source_id": "ccbc12/problems/f/p1876",
        "filename": "LightGame.vue",
    },
    "C12Calc": {
        "parent_source_id": "ccbc12/problems/f/p2040",
        "filename": "C12Calc.vue",
    },
}
FIRST_PARTY_HOSTS = {
    "archive.cipherpuzzles.com",
    "ccbc11.cipherpuzzles.com",
    "ccbc12.cipherpuzzles.com",
    "ccbc13.cipherpuzzles.com",
    "ccbc14.cipherpuzzles.com",
    "ccbc15.cipherpuzzles.com",
    "ccbc16.cipherpuzzles.com",
    "static.cipherpuzzles.com",
    "imgsa.baidu.com",
    "imgsrc.baidu.com",
    "tiebapic.baidu.com",
}
TEXT_ASSET_SUFFIXES = {".css", ".html", ".htm", ".js", ".json", ".svg", ".txt", ".vue"}
IMAGE_SUFFIXES = {".bmp", ".gif", ".jpeg", ".jpg", ".png", ".svg", ".webp"}
ASSET_SUFFIXES = TEXT_ASSET_SUFFIXES | {
    ".7z", ".aac", ".avi", ".bin", ".bmp", ".csv", ".doc", ".docx", ".eot", ".exe",
    ".flac", ".gif", ".gltf", ".glb", ".ico", ".jpeg", ".jpg", ".m4a", ".m4v",
    ".mid", ".midi", ".mov", ".mp3", ".mp4", ".ogg", ".otf", ".pdf", ".png",
    ".ppt", ".pptx", ".rar", ".rtf", ".tar", ".tsv", ".ttf", ".wav", ".wasm",
    ".drawio", ".rb", ".webm", ".webp", ".woff", ".woff2", ".xls", ".xlsx",
    ".xml", ".zip",
}
URL_TOKEN_RE = re.compile(
    r"https?://[^\s\"'<>\\)\]），。；：！？、】」』》]+",
    re.I,
)
ATTR_URL_RE = re.compile(r"(?:src|href|poster)\s*=\s*[\"']([^\"']+)[\"']", re.I)
CSS_URL_RE = re.compile(r"url\(\s*[\"']?([^\"')]+)", re.I)
MARKDOWN_URL_RE = re.compile(r"!?\[[^\]]*\]\(([^\s\)]+)", re.I)
QUOTED_ASSET_RE = re.compile(
    r"[\"']([^\s\"'<>]+(?:"
    + "|".join(re.escape(suffix) for suffix in sorted(ASSET_SUFFIXES, key=len, reverse=True))
    + r")(?:\?[^\"']*)?)[\"']",
    re.I,
)


def utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def json_dump(value: Any, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def atomic_write_bytes(path: Path, body: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_name(f".{path.name}.{os.getpid()}.{threading.get_ident()}.tmp")
    try:
        temporary.write_bytes(body)
        temporary.replace(path)
    finally:
        temporary.unlink(missing_ok=True)


def validate_raw_body(body: bytes, relative_path: str, content_type: str = "") -> None:
    if not body:
        raise FetchError(f"Empty raw response for {relative_path}")
    suffix = PurePosixPath(relative_path).suffix.lower()
    prefix = body.lstrip()[:64].lower()
    if suffix not in {".html", ".htm"} and prefix.startswith((b"<!doctype html", b"<html")):
        raise FetchError(f"Unexpected HTML fallback for raw file {relative_path}")
    if suffix == ".json":
        try:
            json.loads(body.decode("utf-8-sig"))
        except (UnicodeDecodeError, json.JSONDecodeError) as exc:
            raise FetchError(f"Invalid JSON raw response for {relative_path}: {exc}") from exc
    if content_type.startswith("text/html") and suffix not in {".html", ".htm"}:
        raise FetchError(f"Unexpected HTML content type for raw file {relative_path}")


def as_text(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, list):
        return "\n\n".join(as_text(item) for item in value if item is not None).strip()
    if isinstance(value, dict):
        return json.dumps(value, ensure_ascii=False, indent=2)
    return str(value).replace("\r\n", "\n").replace("\r", "\n").strip()


def markdown_to_text(value: str) -> str:
    if not value:
        return ""
    try:
        rendered = markdown.markdown(value, extensions=["tables", "fenced_code", "sane_lists"])
    except Exception:
        rendered = value
    soup = BeautifulSoup(rendered, "html.parser")
    for node in soup(["script", "style"]):
        node.decompose()
    text = soup.get_text("\n")
    text = html.unescape(text).replace("\xa0", " ")
    text = re.sub(r"[ \t]+\n", "\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def stable_id(*parts: Any) -> str:
    cleaned = []
    for part in parts:
        token = str(part).strip().lower()
        token = re.sub(r"[^0-9a-zA-Z_-]+", "-", token).strip("-")
        cleaned.append(token or "unknown")
    return ":".join(cleaned)


def normalize_url(url: str) -> str:
    parsed = urlparse(url)
    return urlunparse((parsed.scheme.lower(), parsed.netloc.lower(), parsed.path, "", parsed.query, parsed.fragment))


def is_archive_navigation(url: str) -> bool:
    parsed = urlparse(url)
    return (
        parsed.hostname == "archive.cipherpuzzles.com"
        and parsed.path.endswith("/index.html")
        and parsed.fragment.startswith(("/problem?", "/index?"))
    )


def looks_like_asset(url: str) -> bool:
    if is_archive_navigation(url):
        return False
    parsed = urlparse(url)
    suffix = PurePosixPath(unquote(parsed.path)).suffix.lower()
    return suffix in ASSET_SUFFIXES


def first_party(url: str) -> bool:
    return urlparse(url).hostname in FIRST_PARTY_HOSTS


def extract_url_references(
    text: str, base_url: str, assets_only: bool = False, allow_quoted_assets: bool = True,
) -> list[tuple[str, str]]:
    if not text:
        return []
    candidates: list[tuple[str, str]] = []
    candidates.extend((match.group(1), "attribute") for match in ATTR_URL_RE.finditer(text))
    candidates.extend((match.group(1), "css") for match in CSS_URL_RE.finditer(text))
    candidates.extend((match.group(1), "markdown") for match in MARKDOWN_URL_RE.finditer(text))
    if allow_quoted_assets:
        for match in QUOTED_ASSET_RE.finditer(text):
            prefix = text[max(0, match.start() - 32):match.start()]
            if re.search(r"\bdownload\s*=\s*$", prefix, flags=re.I):
                continue
            candidates.append((match.group(1), "quoted_asset"))
    candidates.extend((match.group(0), "absolute") for match in URL_TOKEN_RE.finditer(text))
    result: list[tuple[str, str]] = []
    seen: set[tuple[str, str]] = set()
    for raw, context in candidates:
        raw = html.unescape(raw.strip().strip("`\"'"))
        raw = raw.rstrip(".,;:!?，。；：！？）、】」』》")
        if not raw or raw.startswith(("#", "data:", "javascript:", "mailto:")):
            continue
        if any(token in raw for token in ("${", "{{", "}}")):
            continue
        if raw.startswith("//"):
            host_match = re.match(r"^//([A-Za-z0-9.-]+)(?::\d+)?(?:/|$)", raw)
            host = host_match.group(1).lower() if host_match else ""
            tld = host.rsplit(".", 1)[-1] if "." in host else ""
            context_is_structured = context in {"attribute", "css", "markdown"}
            if (
                not host_match
                or not (host == "localhost" or re.fullmatch(r"[a-z]{2,24}", tld))
                or (not context_is_structured and "/" not in raw[2:])
            ):
                continue
        try:
            absolute = normalize_url(urljoin(base_url, raw))
        except ValueError:
            continue
        if assets_only and not looks_like_asset(absolute):
            continue
        pair = (raw, absolute)
        if pair not in seen:
            seen.add(pair)
            result.append(pair)
    return result


class FetchError(RuntimeError):
    pass


class Fetcher:
    def __init__(self, raw_root: Path, refresh: bool = False, delay: float = 0.04):
        self.raw_root = raw_root
        self.refresh = refresh
        self.delay = delay
        self.local = threading.local()
        self.lock = threading.Lock()
        self.stats = Counter()
        self.failures: list[dict[str, Any]] = []

    def session(self) -> requests.Session:
        if not hasattr(self.local, "session"):
            session = requests.Session()
            session.headers.update({
                "User-Agent": "CCBCArchiveCorpusBuilder/1.0 (personal research archive)",
                "Accept-Encoding": "gzip, deflate",
            })
            self.local.session = session
        return self.local.session

    def request(
        self, url: str, *, expected: set[int] | None = None,
        headers: dict[str, str] | None = None,
    ) -> requests.Response:
        expected = expected or {200}
        error: Exception | None = None
        for attempt in range(4):
            try:
                if self.delay:
                    time.sleep(self.delay)
                response = self.session().get(
                    url, headers=headers, timeout=(15, 90), allow_redirects=True,
                )
                with self.lock:
                    self.stats[f"http_{response.status_code}"] += 1
                if response.status_code in expected:
                    return response
                if response.status_code not in {429, 500, 502, 503, 504}:
                    raise FetchError(f"HTTP {response.status_code}: {url}")
                error = FetchError(f"HTTP {response.status_code}: {url}")
            except (requests.RequestException, FetchError) as exc:
                error = exc
            time.sleep(0.6 * (2 ** attempt))
        raise FetchError(str(error or f"Unable to fetch {url}"))

    def get_raw(
        self, url: str, relative_path: str, *, headers: dict[str, str] | None = None,
        expected_prefix: bytes | None = None,
    ) -> tuple[bytes, str]:
        path = self.raw_root / relative_path
        if path.exists() and not self.refresh:
            body = path.read_bytes()
            try:
                validate_raw_body(body, relative_path)
                if expected_prefix and not body.startswith(expected_prefix):
                    raise FetchError(f"Unexpected raw response signature for {relative_path}")
            except FetchError:
                with self.lock:
                    self.stats["invalid_raw_cache_entries"] += 1
            else:
                with self.lock:
                    self.stats["raw_cache_hits"] += 1
                return body, url
        response = self.request(url, headers=headers)
        content_type = response.headers.get("Content-Type", "").split(";", 1)[0].lower()
        validate_raw_body(response.content, relative_path, content_type)
        if expected_prefix and not response.content.startswith(expected_prefix):
            raise FetchError(f"Unexpected raw response signature for {relative_path}")
        content_length = response.headers.get("Content-Length")
        if (
            content_length and content_length.isdigit()
            and not response.headers.get("Content-Encoding")
            and int(content_length) != len(response.content)
        ):
            raise FetchError(
                f"Content-Length mismatch for raw file {relative_path}: "
                f"expected {content_length}, got {len(response.content)}"
            )
        atomic_write_bytes(path, response.content)
        with self.lock:
            self.stats["raw_downloads"] += 1
        return response.content, response.url

    def note_failure(self, url: str, category: str, error: Exception | str) -> None:
        with self.lock:
            self.failures.append({"url": url, "category": category, "error": str(error)})


def safe_raw_relative(prefix: str, logical_path: str, suffix: str) -> str:
    logical = PurePosixPath(logical_path.strip("/"))
    if ".." in logical.parts:
        raise ValueError(f"Unsafe source path: {logical_path}")
    return str(PurePosixPath(prefix) / logical) + suffix


def yaml_record_path(logical_path: str) -> str:
    return safe_raw_relative(logical_path.split("/", 1)[0], logical_path.split("/", 1)[1], ".yaml")


def load_yaml_archive(fetcher: Fetcher, edition: int) -> tuple[dict[str, dict[str, Any]], list[dict[str, str]]]:
    start = f"ccbc{edition}/index"
    queue: deque[str] = deque([start])
    documents: dict[str, dict[str, Any]] = {}
    failures: list[dict[str, str]] = []
    while queue:
        logical_path = queue.popleft()
        if logical_path in documents:
            continue
        url = f"{ARCHIVE_ROOT}{logical_path}.yaml"
        try:
            body, _ = fetcher.get_raw(url, yaml_record_path(logical_path))
            data = yaml.safe_load(body.decode("utf-8"))
            if not isinstance(data, dict):
                raise ValueError("YAML root is not a mapping")
            documents[logical_path] = data
        except Exception as exc:
            failures.append({"path": logical_path, "url": url, "error": str(exc)})
            fetcher.note_failure(url, "yaml_document", exc)
            continue
        for link in data.get("links") or []:
            if not isinstance(link, dict):
                continue
            target = link.get("path")
            if isinstance(target, str) and target.startswith(f"ccbc{edition}/") and target not in documents:
                queue.append(target)
    return documents, failures


def infer_kind(title: str, path: str, data: dict[str, Any], explicit: str | None = None) -> str:
    if explicit:
        return explicit
    if path == "ccbc12/problems/mm":
        return "final_meta"
    answer_type = data.get("answer_type", data.get("answer-type"))
    if answer_type == 3:
        return "final_meta"
    if answer_type == 1:
        return "meta"
    haystack = f"{title} {path}".lower()
    if any(token in haystack for token in ("final meta", "finalmeta", "最后的谜题", "最终元", "/fm")):
        return "final_meta"
    if any(token in haystack for token in ("meta", "小结", "总结", "终结点")) or re.search(r"/m[a-z0-9]*$", path):
        return "meta"
    return "puzzle"


def infer_yaml_area(edition: int, path: str, data: dict[str, Any]) -> str:
    parts = path.split("/")
    if edition == 11:
        return "案情总结" if "/m" in path else "案情分析板"
    if edition == 12:
        if "loopstage" in path:
            return "序章"
        if "problems" in parts:
            idx = parts.index("problems")
            if idx + 1 < len(parts):
                code = parts[idx + 1]
                if code in "abcdef":
                    return f"时间线{code.upper()}"
                if code in {"meta", "m"}:
                    return "Meta"
        return "正篇"
    if edition == 15:
        area_names = {
            "1": "面试", "2": "与天才美少女的烹饪对决", "3": "科学的深入浅出",
            "4": "全球呼叫出题组", "5": "爆吧大战", "6": "我爱猫猫!",
            "7": "孬题杀死了出题明星", "meta": "Meta",
        }
        if "problems" in parts:
            idx = parts.index("problems")
            if idx + 1 < len(parts):
                return area_names.get(parts[idx + 1], parts[idx + 1])
    return as_text(data.get("area"))


def collect_interactive(data: dict[str, Any]) -> dict[str, str]:
    aliases = {
        "html": ("html",),
        "javascript": ("content-js", "content_js", "script"),
        "css": ("content-css", "content_css"),
        "vue_template": ("vue-template", "vue_template"),
        "vue_script": ("vue-script", "vue_script"),
    }
    result: dict[str, str] = {}
    for output_key, keys in aliases.items():
        for key in keys:
            value = as_text(data.get(key))
            if value:
                result[output_key] = value
                break
    return result


def classify_solution(solution_markdown: str, solution_text: str) -> str:
    """Separate substantive writeups from links and official placeholders."""
    compact = re.sub(r"\s+", "", solution_text).lower()
    if not compact and not solution_markdown.strip():
        return "missing_official"
    placeholder_markers = (
        "暂无解析", "没有解析", "未填写解析", "暂未提供解析", "解析暂缺",
        "之后会发", "以后会发", "后续会发", "将在b站", "请期待后续",
    )
    if len(compact) < 160 and any(marker in compact for marker in placeholder_markers):
        return "missing_official"
    if len(compact) < 220 and (
        "docs.qq.com" in solution_markdown.lower()
        or ("解析链接" in compact and "http" in solution_markdown.lower())
    ):
        return "external_only"
    stripped = solution_markdown.strip()
    if len(compact) < 300 and re.fullmatch(r"https?://\S+", stripped, flags=re.I):
        return "external_only"
    return "available"


def normalize_hints(data: dict[str, Any]) -> list[dict[str, Any]]:
    hints = data.get("tips") or data.get("hints") or []
    result = []
    for index, hint in enumerate(hints, start=1):
        if isinstance(hint, dict):
            title = as_text(hint.get("title") or hint.get("name"))
            body = as_text(hint.get("content") or hint.get("text") or hint.get("message"))
            number = hint.get("num", hint.get("tip_num", index))
        else:
            title, body, number = "", as_text(hint), index
        result.append({"number": number, "title": title, "markdown": body, "text": markdown_to_text(body)})
    return result


def normalize_additional_answers(data: dict[str, Any]) -> list[dict[str, str]]:
    values = data.get("additional-answers") or data.get("additional_answers") or []
    result = []
    for value in values:
        if isinstance(value, dict):
            result.append({
                "answer": as_text(value.get("answer")),
                "message": as_text(value.get("message")),
                "extra": as_text(value.get("extra")),
            })
    return result


def make_record(
    *,
    record_id: str,
    event_id: str,
    editions: list[str],
    year: int,
    area: str,
    kind: str,
    source_id: str,
    source_url: str,
    raw_path: str,
    data: dict[str, Any],
    fetched_at: str,
    parent_id: str | None = None,
    question_override: str | None = None,
    solution_override: str | None = None,
    title_override: str | None = None,
    image_override: str | None = None,
) -> dict[str, Any]:
    title = title_override if title_override is not None else as_text(data.get("title"))
    question = question_override if question_override is not None else as_text(data.get("content"))
    extended = as_text(data.get("extend-content", data.get("extend_content")))
    solution = solution_override if solution_override is not None else as_text(
        data.get("answer-analysis", data.get("answer_analysis", data.get("analysis") or data.get("solution")))
    )
    image_url = image_override if image_override is not None else as_text(
        data.get("problem-image", data.get("problem_image", data.get("image")))
    )
    if image_url and image_url not in question:
        question = (question + "\n\n" if question else "") + f"![题图]({image_url})"
    author_value = data.get("author", data.get("authors", []))
    if isinstance(author_value, list):
        authors = [as_text(item) for item in author_value if as_text(item)]
    else:
        author = as_text(author_value)
        authors = [part.strip() for part in re.split(r"[,，、;/]", author) if part.strip()] if author else []
    solution_text = markdown_to_text(solution)
    solution_status = classify_solution(solution, solution_text)
    source_metadata = {
        key: data[key]
        for key in (
            "desc", "type", "content-type", "content_type", "answer-type", "answer_type",
            "extend_data", "check_answer_function", "pgid", "pg_name", "components",
        )
        if key in data and data[key] not in (None, "", [], {})
    }
    extend_data = data.get("extend_data")
    parsed_extend_data = extend_data
    if isinstance(extend_data, str):
        try:
            parsed_extend_data = json.loads(extend_data)
        except (json.JSONDecodeError, TypeError):
            parsed_extend_data = extend_data
    if urlparse(source_url).hostname == "ccbc16.cipherpuzzles.com" and isinstance(parsed_extend_data, dict):
        image_name = as_text(parsed_extend_data.get("imgUrl"))
        if image_name and not urlparse(image_name).scheme:
            source_metadata["resolved_extend_assets"] = [
                f"https://static.cipherpuzzles.com/static/images/{image_name.lstrip('/')}"
            ]
    interactive = collect_interactive(data)
    question_text = markdown_to_text(question)
    if "本题内容缺失" in question_text:
        content_status = "missing_official"
        content_format = "missing"
    elif question_text:
        content_status = "available"
        content_format = "text"
    elif question.strip() or image_url:
        content_status = "available"
        content_format = "media_or_markup"
    elif interactive:
        content_status = "available"
        content_format = "interactive"
    else:
        content_status = "missing_official"
        content_format = "missing"
    record = {
        "schema_version": "1.0",
        "record_id": record_id,
        "event_id": event_id,
        "editions": editions,
        "year": year,
        "area": area,
        "kind": kind,
        "parent_id": parent_id,
        "source_id": source_id,
        "title": title,
        "authors": authors,
        "answer": as_text(data.get("answer")),
        "question_markdown": question,
        "question_text": question_text,
        "content_status": content_status,
        "content_format": content_format,
        "extended_content_markdown": extended,
        "extended_content_text": markdown_to_text(extended),
        "solution_markdown": solution,
        "solution_text": solution_text,
        "solution_status": solution_status,
        "solution_format": "text" if solution_text else ("media_only" if solution.strip() else "none"),
        "hints": normalize_hints(data),
        "additional_answers": normalize_additional_answers(data),
        "image_url": image_url,
        "interactive": interactive,
        "source_metadata": source_metadata,
        "assets": [],
        "source_url": source_url,
        "raw_path": raw_path,
        "fetched_at": fetched_at,
        "quality": {},
    }
    record["quality"] = {
        "has_question": content_status == "available",
        "has_answer": bool(record["answer"]),
        "has_solution": solution_status == "available",
        "has_solution_reference": solution_status == "external_only",
        "has_hints": bool(record["hints"]),
        "pair_eligible": content_status == "available" and solution_status == "available",
    }
    return record


def build_yaml_records(
    documents: dict[str, dict[str, Any]], edition: int, fetched_at: str
) -> list[dict[str, Any]]:
    records = []
    for path, data in documents.items():
        if data.get("type") != "problem":
            continue
        source_url = f"{ARCHIVE_ROOT}{path}.yaml"
        raw_path = f"data/raw/{yaml_record_path(path)}"
        title = as_text(data.get("title"))
        source_tail = path.split("problems/", 1)[-1]
        records.append(make_record(
            record_id=stable_id(f"ccbc{edition}", "problem", source_tail),
            event_id=f"ccbc{edition}",
            editions=[f"CCBC {edition}" if edition != 10 else "CCBC X"],
            year={10: 2020, 11: 2021, 12: 2022, 15: 2024}[edition],
            area=infer_yaml_area(edition, path, data),
            kind=infer_kind(title, path, data),
            source_id=path,
            source_url=source_url,
            raw_path=raw_path,
            data=data,
            fetched_at=fetched_at,
        ))
    return records


def enrich_c12_records(
    fetcher: Fetcher, records: list[dict[str, Any]], fetched_at: str,
) -> list[dict[str, Any]]:
    """Preserve the archived Vue components and normalize the 24 loop puzzles."""
    parents = {record["source_id"]: record for record in records}
    loop_source_id = "ccbc12/pages/loopstage_main"
    loop_parent = parents.get(loop_source_id)
    if not loop_parent:
        raise RuntimeError("CCBC 12 loopstage parent record is missing")
    try:
        problem_list = _parse_js_declaration(loop_parent["interactive"]["javascript"], "problemList")
    except (KeyError, ValueError) as exc:
        raise RuntimeError("CCBC 12 loopstage problemList could not be parsed") from exc
    if not isinstance(problem_list, list) or len(problem_list) != 24:
        raise RuntimeError(f"CCBC 12 loopstage count mismatch: {len(problem_list)}")

    loop_parent["source_metadata"].update({
        "archived_subpuzzle_count": 24,
        "original_generator_note": "The live event generated puzzles from a 6000-word pool; the official archive preserves 24.",
    })
    subrecords = []
    for number, item in enumerate(problem_list, start=1):
        if not isinstance(item, dict) or not as_text(item.get("content")) or not as_text(item.get("answer")):
            raise RuntimeError(f"CCBC 12 loopstage item {number} is incomplete")
        record = make_record(
            record_id=stable_id("ccbc12", "loopstage", number),
            event_id="ccbc12",
            editions=["CCBC 12"],
            year=2022,
            area="序章",
            kind="subpuzzle",
            source_id=f"{loop_source_id}:problemList:{number}",
            source_url=f"{loop_parent['source_url']}#problemList-{number}",
            raw_path=loop_parent["raw_path"],
            data={
                "title": f"序章循环题 {number}",
                "content": as_text(item["content"]),
                "answer": as_text(item["answer"]),
            },
            fetched_at=fetched_at,
            parent_id=loop_parent["record_id"],
        )
        record["source_metadata"].update({
            "collection": "loopstage_problemList",
            "sequence_number": number,
            "display_type": item.get("type"),
            "solution_reference_record_id": loop_parent["record_id"],
        })
        record["solution_status"] = "available_via_parent"
        record["solution_format"] = "parent_reference"
        record["quality"]["has_solution_reference"] = True
        subrecords.append(record)

    for component_name, config in C12_COMPONENTS.items():
        parent = parents.get(config["parent_source_id"])
        if not parent:
            raise RuntimeError(f"CCBC 12 component parent is missing: {component_name}")
        declared_components = {
            as_text(component.get("name"))
            for component in parent["source_metadata"].get("components", [])
            if isinstance(component, dict)
        }
        if component_name not in declared_components:
            raise RuntimeError(f"CCBC 12 component declaration is missing: {component_name}")
        filename = config["filename"]
        source_url = (
            "https://raw.githubusercontent.com/CipherPuzzles/CCBCArchive/"
            f"{C12_ARCHIVE_COMMIT}/src/components/{filename}"
        )
        relative = f"ccbc12/components/{filename}"
        body, _ = fetcher.get_raw(source_url, relative)
        source = body.decode("utf-8-sig", errors="replace")
        if len(source) < 1000 or "<template>" not in source or "<script" not in source:
            raise RuntimeError(f"CCBC 12 component source is incomplete: {component_name}")
        parent["interactive"][f"component_{component_name}"] = source
        parent["source_metadata"].setdefault("component_sources", []).append({
            "name": component_name,
            "source_url": source_url,
            "raw_path": f"data/raw/{relative}",
            "repository_commit": C12_ARCHIVE_COMMIT,
        })
    return subrecords


def c13_sources() -> list[dict[str, Any]]:
    sources: list[dict[str, Any]] = []
    for number in range(101, 189):
        sources.append({
            "source_id": f"asteroid/{number}", "area": "小行星数据库", "kind": "puzzle",
            "editions": ["CCBC 13", "CCBC 14"],
        })
    for number in range(1, 17):
        sources.append({
            "source_id": f"CCBC-13/{number}", "area": "CCBC-13", "kind": "puzzle",
            "editions": ["CCBC 13"],
        })
    sources.append({
        "source_id": "CCBC-13/13417491", "area": "CCBC-13", "kind": "meta", "editions": ["CCBC 13"],
    })
    for number in range(17, 33):
        sources.append({
            "source_id": f"CCBC-14/{number}", "area": "CCBC-14", "kind": "puzzle",
            "editions": ["CCBC 14"],
        })
    sources.append({
        "source_id": "CCBC-14/13417492", "area": "CCBC-14", "kind": "meta", "editions": ["CCBC 14"],
    })
    sources.append({
        "source_id": "CCBC-1314/1314", "area": "CCBC-1314", "kind": "final_meta",
        "editions": ["CCBC 13", "CCBC 14"],
    })
    return sources


def load_c13_records(fetcher: Fetcher, fetched_at: str) -> list[dict[str, Any]]:
    documents, failures = load_yaml_archive(fetcher, 13)
    if failures:
        raise RuntimeError(f"CCBC 13/14 discovery has {len(failures)} failed YAML documents")
    expected_paths = {f"ccbc13/problems/{item['source_id']}" for item in c13_sources()}
    discovered_paths = {
        path for path, data in documents.items()
        if data.get("type") == "problem" and path.startswith("ccbc13/problems/")
    }
    if discovered_paths != expected_paths:
        missing = sorted(expected_paths - discovered_paths)
        extra = sorted(discovered_paths - expected_paths)
        raise RuntimeError(f"CCBC 13/14 index mismatch; missing={missing[:5]}, extra={extra[:5]}")
    records = []
    for source in c13_sources():
        source_id = source["source_id"]
        relative = safe_raw_relative("ccbc13", f"problems/{source_id}", ".yaml")
        url = f"{ARCHIVE_ROOT}ccbc13/problems/{source_id}.yaml"
        data = documents[f"ccbc13/problems/{source_id}"]
        records.append(make_record(
            record_id=stable_id("ccbc13-14", source_id),
            event_id="ccbc13-14",
            editions=source["editions"],
            year=2023,
            area=source["area"],
            kind=source["kind"],
            source_id=source_id,
            source_url=url,
            raw_path=f"data/raw/{relative}",
            data=data,
            fetched_at=fetched_at,
        ))
    tower_dependencies = [f"/ccbc13/images/CCBC-14/tower/t-{number:02d}.webp" for number in range(1, 14)]
    tower_dependencies.insert(0, "/ccbc13/images/CCBC-14/tower/bg.webp")
    tower_parent = next(
        (
            record for record in records
            if "tower/" in json.dumps(record.get("interactive", {}), ensure_ascii=False)
        ),
        next(record for record in records if record["source_id"] == "CCBC-14/19"),
    )
    tower_parent["source_metadata"]["dynamic_dependencies"] = tower_dependencies
    special_dependencies = {
        "scowl": "/ccbc13/problems/CCBC-13/scowl.json",
        "impartial": "/ccbc13/scripts/CCBC-14/impartialGame20Api.js",
    }
    serialized = {
        record["record_id"]: json.dumps(record.get("interactive", {}), ensure_ascii=False).lower()
        for record in records
    }
    for needle, dependency in special_dependencies.items():
        matches = [record for record in records if needle in serialized[record["record_id"]]]
        if len(matches) != 1:
            raise RuntimeError(f"CCBC 13/14 dynamic dependency match for {needle}: {len(matches)}")
        target = matches[0]
        target["source_metadata"].setdefault("dynamic_dependencies", []).append(dependency)
    return records


C15_BACKEND_KEYS = {
    6: "c15-c15-6",
    22: "c15-c12-8",
    29: "c15-ccbc-moe",
    31: "c15-geom",
    38: "c15-c9meta-getpart2",
    43: "c15-dreamland",
    47: "c15-typing-game",
}


def enrich_c15_records(fetcher: Fetcher, records: list[dict[str, Any]]) -> None:
    map_url = f"{ARCHIVE_ROOT}ccbc15/problems/map.yaml"
    body, _ = fetcher.get_raw(map_url, "ccbc15/problems/map.yaml")
    map_payload = yaml.safe_load(body.decode("utf-8"))
    mapping = map_payload.get("map") if isinstance(map_payload, dict) else None
    if not isinstance(mapping, dict) or len(mapping) != 75:
        raise RuntimeError("CCBC 15 official map does not contain exactly 75 puzzles")
    numeric_records = {
        int(match.group(1)): record
        for record in records
        if (match := re.search(r"/(\d+)$", record["source_id"]))
    }
    if set(numeric_records) != set(range(1, 76)):
        raise RuntimeError("CCBC 15 normalized records do not cover puzzle IDs 1..75")
    for pid, key in C15_BACKEND_KEYS.items():
        url = f"{ARCHIVE_ROOT}ccbc15/scripts/{key}.yaml"
        relative = f"ccbc15/scripts/{key}.yaml"
        script_body, _ = fetcher.get_raw(url, relative)
        payload = yaml.safe_load(script_body.decode("utf-8"))
        if not isinstance(payload, dict):
            raise RuntimeError(f"CCBC 15 backend {key} is not a YAML mapping")
        script = as_text(payload.get("script") or payload)
        numeric_records[pid]["interactive"][f"backend_{key}"] = script
        numeric_records[pid]["source_metadata"].setdefault("backend_sources", []).append({
            "key": key,
            "source_url": url,
            "raw_path": f"data/raw/{relative}",
        })
    external_only = {34, 36, 43, 46, 47, 55, 68}
    missing_official = {7, 42, 44, 54, 63, 71}
    for pid, record in numeric_records.items():
        if pid in external_only:
            status = "external_only"
        elif pid in missing_official:
            status = "missing_official"
        else:
            status = "available"
        record["solution_status"] = status
        record["quality"]["has_solution"] = status == "available"
        record["quality"]["has_solution_reference"] = status == "external_only"
    title_only = numeric_records[51]
    title_only["content_status"] = "available"
    title_only["content_format"] = "title_only"
    title_only["quality"]["has_question"] = True
    for pid in sorted(external_only):
        record = numeric_records[pid]
        references = [absolute for _, absolute in extract_url_references(
            record["solution_markdown"], record["source_url"], assets_only=False
        ) if urlparse(absolute).hostname == "docs.qq.com"]
        if len(references) != 1:
            raise RuntimeError(f"CCBC 15 puzzle {pid} official solution link mismatch")
        link = references[0]
        parsed = urlparse(link)
        token = PurePosixPath(parsed.path).name
        page_relative = f"ccbc15/external_solutions/{pid}-{token}.html"
        page_body, _ = fetcher.get_raw(link, page_relative)
        snapshot = {
            "source_url": link,
            "page_raw_path": f"data/raw/{page_relative}",
            "page_bytes": len(page_body),
            "page_sha256": hashlib.sha256(page_body).hexdigest(),
            "data_snapshot": None,
        }
        if "/sheet/" in parsed.path:
            soup = BeautifulSoup(page_body.decode("utf-8-sig", errors="replace"), "html.parser")
            loader = soup.select_one("script#opendoc-jsonp")
            if not loader or not loader.get("src"):
                raise RuntimeError(f"CCBC 15 puzzle {pid} Tencent sheet has no public opendoc loader")
            data_url = urljoin(link, xml_unescape(loader["src"]))
            data_relative = f"ccbc15/external_solutions/{pid}-{token}-opendoc.js"
            data_body, _ = fetcher.get_raw(
                data_url,
                data_relative,
                headers={"Referer": link},
                expected_prefix=b"clientVarsCallback(",
            )
            snapshot["data_snapshot"] = {
                "source_url": data_url,
                "raw_path": f"data/raw/{data_relative}",
                "bytes": len(data_body),
                "sha256": hashlib.sha256(data_body).hexdigest(),
                "format": "Tencent Docs opendoc JSONP with compressed sheet protobuf blocks",
            }
        record["source_metadata"]["external_solution_snapshot"] = snapshot


def enrich_c16_fragments(
    fetcher: Fetcher, records: list[dict[str, Any]], fetched_at: str,
) -> list[dict[str, Any]]:
    """Normalize the official fragment grid and restore its ten parent questions."""
    source_url = f"{C16_ROOT}data/articles/fragments.json"
    relative = "ccbc16/data/articles/fragments.json"
    body, _ = fetcher.get_raw(source_url, relative)
    payload = json.loads(body.decode("utf-8-sig"))
    xml = as_text(payload.get("content")) if isinstance(payload, dict) else ""
    root = ET.fromstring(xml)
    elements = root.findall("f")
    expected_positions = {f"{row},{column}" for row in range(8) for column in range(4)}
    positions = {element.attrib.get("pos", "") for element in elements}
    if len(elements) != 32 or positions != expected_positions:
        raise RuntimeError("CCBC 16 fragment archive is not the expected 8x4 grid")

    by_pid = {
        int(record["source_id"]): record
        for record in records
        if record["event_id"] == "ccbc16" and record["source_id"].isdigit()
    }
    fragment_records: list[dict[str, Any]] = []
    fragment_by_thumb: dict[str, dict[str, Any]] = {}
    for element in elements:
        position = element.attrib["pos"]
        row, column = (int(part) for part in position.split(","))
        inner = (element.text or "") + "".join(
            ET.tostring(child, encoding="unicode") for child in element
        )
        thumb = element.attrib.get("thumb", "")
        fragment = make_record(
            record_id=stable_id("ccbc16", "fragment", position),
            event_id="ccbc16",
            editions=["CCBC 16"],
            year=2025,
            area="碎片",
            kind="subpuzzle",
            source_id=f"fragment:{position}",
            source_url=f"{source_url}#pos={position}",
            raw_path=f"data/raw/{relative}",
            data={"title": f"碎片 {row + 1}-{column + 1}", "content": inner, "image": thumb},
            fetched_at=fetched_at,
        )
        fragment["source_metadata"].update({
            "collection": "fragments",
            "position_zero_based": [row, column],
            "position_one_based": [row + 1, column + 1],
            "fragment_attributes": dict(element.attrib),
            "dynamic": element.attrib.get("dynamic") == "true",
        })
        if element.attrib.get("src"):
            fragment["interactive"]["fragment_component"] = element.attrib["src"]
        fragment_records.append(fragment)
        if thumb:
            fragment_by_thumb[thumb] = fragment

    target_pids = set(range(34, 44))
    assignments: dict[str, list[int]] = {fragment["record_id"]: [] for fragment in fragment_records}
    linked_by_pid: dict[int, list[dict[str, Any]]] = {}
    for pid in target_pids:
        parent = by_pid[pid]
        linked = []
        for thumb, fragment in fragment_by_thumb.items():
            if thumb in parent["solution_markdown"]:
                linked.append(fragment)
        linked_by_pid[pid] = linked
        for fragment in linked:
            assignments[fragment["record_id"]].append(pid)

    # This fragment has a backend-generated thumbnail. Its stored ab0f... thumbnail is
    # replaced by d53b... at runtime, so it cannot be joined through analysis HTML alone.
    dynamic_fragment = next(
        fragment for fragment in fragment_records
        if fragment["source_metadata"]["position_zero_based"] == [6, 1]
    )
    if not dynamic_fragment["source_metadata"]["dynamic"] or assignments[dynamic_fragment["record_id"]]:
        raise RuntimeError("CCBC 16 dynamic fragment 6,1 was not uniquely identifiable")
    linked_by_pid[43].append(dynamic_fragment)
    assignments[dynamic_fragment["record_id"]].append(43)
    dynamic_fragment["source_metadata"].update({
        "assignment_method": "backend_dynamic_thumbnail",
        "runtime_thumbnail": "https://static.cipherpuzzles.com/static/images/d53bccc8ef564a98a61ab0edbd620af1.webp",
    })

    expected_counts = {34: 4, 35: 3, 36: 3, 37: 3, 38: 3, 39: 2, 40: 4, 41: 4, 42: 4, 43: 2}
    actual_counts = {pid: len(linked) for pid, linked in linked_by_pid.items()}
    if actual_counts != expected_counts:
        raise RuntimeError(f"CCBC 16 fragment parent counts mismatch: {actual_counts}")
    invalid_assignments = {
        record_id: parent_pids for record_id, parent_pids in assignments.items()
        if len(parent_pids) != 1
    }
    if invalid_assignments:
        raise RuntimeError(f"CCBC 16 fragments do not have exactly one parent: {invalid_assignments}")

    for pid in sorted(target_pids):
        parent = by_pid[pid]
        linked = sorted(
            linked_by_pid[pid],
            key=lambda record: record["source_metadata"]["position_zero_based"],
        )
        fragment_ids = [fragment["record_id"] for fragment in linked]
        parent["interactive"]["fragment_source"] = source_url
        parent["source_metadata"]["fragment_record_ids"] = fragment_ids
        parent["source_metadata"]["fragment_positions"] = [
            fragment["source_metadata"]["position_zero_based"] for fragment in linked
        ]
        fragment_content = "\n\n".join(
            f"## {fragment['title']}\n\n{fragment['question_markdown']}" for fragment in linked
        )
        parent["question_markdown"] = "\n\n".join(
            part for part in (parent["question_markdown"], fragment_content) if part
        )
        parent["question_text"] = markdown_to_text(parent["question_markdown"])
        parent["content_status"] = "available"
        parent["content_format"] = "text" if parent["question_text"] else "media_or_markup"
        parent["quality"]["has_question"] = True
        for fragment in linked:
            fragment["parent_id"] = parent["record_id"]
            fragment["source_metadata"]["parent_pid"] = pid
            fragment["source_metadata"]["solution_reference_record_id"] = parent["record_id"]
            fragment["source_metadata"].setdefault("assignment_method", "analysis_thumbnail_match")
            fragment["solution_status"] = "available_via_parent"
            fragment["solution_format"] = "parent_reference"
            fragment["quality"]["has_solution_reference"] = True
    return fragment_records


C16_BACKEND_SCRIPTS = {
    "c16-emoji": 8,
    "c16-imagine": 13,
    "c16-novel": 16,
    "c16-review": 20,
    "c16-onlyextract": 32,
    "c16-escapeRoom": 43,
    "c16-poker": 45,
    "c16-triddles": 46,
    "c16-puzzle-solving-test": 47,
    "c16-brackets": 48,
    "c16-finalmeta": 55,
}


class _JSLiteralParser:
    """Parse the JSON-like data declarations in the archived backend scripts."""

    def __init__(self, source: str, position: int = 0):
        self.source = source
        self.position = position

    def _skip_space(self) -> None:
        while self.position < len(self.source):
            if self.source[self.position].isspace():
                self.position += 1
            elif self.source.startswith("//", self.position):
                end = self.source.find("\n", self.position + 2)
                self.position = len(self.source) if end < 0 else end + 1
            elif self.source.startswith("/*", self.position):
                end = self.source.find("*/", self.position + 2)
                if end < 0:
                    raise ValueError("unterminated JavaScript block comment")
                self.position = end + 2
            else:
                break

    def _string(self) -> str:
        quote = self.source[self.position]
        self.position += 1
        output: list[str] = []
        simple_escapes = {
            "b": "\b", "f": "\f", "n": "\n", "r": "\r", "t": "\t",
            "v": "\v", "0": "\0", "'": "'", '"': '"', "\\": "\\", "/": "/",
        }
        while self.position < len(self.source):
            char = self.source[self.position]
            self.position += 1
            if char == quote:
                return "".join(output)
            if char != "\\":
                output.append(char)
                continue
            if self.position >= len(self.source):
                break
            escaped = self.source[self.position]
            self.position += 1
            if escaped in "\r\n":
                if escaped == "\r" and self.position < len(self.source) and self.source[self.position] == "\n":
                    self.position += 1
                continue
            if escaped == "x":
                digits = self.source[self.position:self.position + 2]
                self.position += 2
                output.append(chr(int(digits, 16)))
            elif escaped == "u":
                if self.position < len(self.source) and self.source[self.position] == "{":
                    end = self.source.index("}", self.position + 1)
                    digits = self.source[self.position + 1:end]
                    self.position = end + 1
                else:
                    digits = self.source[self.position:self.position + 4]
                    self.position += 4
                output.append(chr(int(digits, 16)))
            else:
                output.append(simple_escapes.get(escaped, escaped))
        raise ValueError("unterminated JavaScript string")

    def _identifier(self) -> str:
        match = re.match(r"[A-Za-z_$][A-Za-z0-9_$]*", self.source[self.position:])
        if not match:
            raise ValueError(f"expected JavaScript identifier at byte {self.position}")
        self.position += len(match.group(0))
        return match.group(0)

    def parse(self) -> Any:
        self._skip_space()
        if self.position >= len(self.source):
            raise ValueError("unexpected end of JavaScript literal")
        char = self.source[self.position]
        if char in "'\"":
            return self._string()
        if char == "[":
            self.position += 1
            result = []
            while True:
                self._skip_space()
                if self.source[self.position] == "]":
                    self.position += 1
                    return result
                result.append(self.parse())
                self._skip_space()
                if self.source[self.position] == ",":
                    self.position += 1
                    continue
                if self.source[self.position] != "]":
                    raise ValueError(f"expected ',' or ']' at byte {self.position}")
        if char == "{":
            self.position += 1
            result = {}
            while True:
                self._skip_space()
                if self.source[self.position] == "}":
                    self.position += 1
                    return result
                key = self._string() if self.source[self.position] in "'\"" else self._identifier()
                self._skip_space()
                if self.source[self.position] != ":":
                    raise ValueError(f"expected ':' at byte {self.position}")
                self.position += 1
                result[key] = self.parse()
                self._skip_space()
                if self.source[self.position] == ",":
                    self.position += 1
                    continue
                if self.source[self.position] != "}":
                    raise ValueError(f"expected ',' or '}}' at byte {self.position}")
        number = re.match(r"-?(?:0[xX][0-9A-Fa-f]+|\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)", self.source[self.position:])
        if number:
            token = number.group(0)
            self.position += len(token)
            if token.lower().startswith("-0x"):
                return -int(token[3:], 16)
            if token.lower().startswith("0x"):
                return int(token, 16)
            return float(token) if any(marker in token for marker in ".eE") else int(token)
        identifier = self._identifier()
        if identifier == "true":
            return True
        if identifier == "false":
            return False
        if identifier in {"null", "undefined"}:
            return None
        raise ValueError(f"unsupported JavaScript expression: {identifier}")


def _parse_js_declaration(source: str, name: str) -> Any:
    declaration = re.search(
        rf"(?m)^[ \t]*(?:const|let|var)[ \t]+{re.escape(name)}[ \t]*=[ \t]*",
        source,
    )
    if not declaration:
        raise ValueError(f"JavaScript declaration not found: {name}")
    return _JSLiteralParser(source, declaration.end()).parse()


def _make_c16_backend_subrecord(
    parent: dict[str, Any], *, script_name: str, sub_id: str, title: str,
    question: str, answer: str, fetched_at: str, metadata: dict[str, Any],
    solution: str = "", image_url: str = "",
) -> dict[str, Any]:
    source_url = f"{C16_ROOT}data/puzzle_script/{script_name}.js"
    raw_path = f"data/raw/ccbc16/data/puzzle_script/{script_name}.js"
    record = make_record(
        record_id=stable_id("ccbc16", "subpuzzle", script_name, sub_id),
        event_id="ccbc16",
        editions=["CCBC 16"],
        year=2025,
        area=parent["area"],
        kind="subpuzzle",
        source_id=f"{script_name}:{sub_id}",
        source_url=f"{source_url}#{sub_id}",
        raw_path=raw_path,
        data={"title": title, "content": question, "answer": answer, "analysis": solution, "image": image_url},
        fetched_at=fetched_at,
        parent_id=parent["record_id"],
    )
    record["source_metadata"].update({
        "parent_pid": int(parent["source_id"]),
        "script_name": script_name,
        "solution_reference_record_id": parent["record_id"],
        **metadata,
    })
    if record["quality"]["has_solution"]:
        record["source_metadata"].pop("solution_reference_record_id", None)
    elif metadata.get("active_in_backend") is False:
        record["solution_status"] = "not_applicable_inactive"
        record["solution_format"] = "none"
        record["source_metadata"]["solution_reference_record_id"] = None
        record["quality"]["has_solution_reference"] = False
    elif record["solution_status"] == "missing_official" and parent["quality"]["has_solution"]:
        record["solution_status"] = "available_via_parent"
        record["solution_format"] = "parent_reference"
        record["quality"]["has_solution_reference"] = True
    elif record["source_metadata"].get("solution_reference_record_id"):
        record["quality"]["has_solution_reference"] = True
    return record


def enrich_c16_backends(
    fetcher: Fetcher, records: list[dict[str, Any]], fetched_at: str,
) -> list[dict[str, Any]]:
    parents = {
        int(record["source_id"]): record
        for record in records
        if record["event_id"] == "ccbc16" and record["source_id"].isdigit()
    }
    if not set(C16_BACKEND_SCRIPTS.values()).issubset(parents):
        raise RuntimeError("CCBC 16 backend parent records are incomplete")
    scripts: dict[str, str] = {}
    for script_name, pid in C16_BACKEND_SCRIPTS.items():
        source_url = f"{C16_ROOT}data/puzzle_script/{script_name}.js"
        relative = f"ccbc16/data/puzzle_script/{script_name}.js"
        body, _ = fetcher.get_raw(source_url, relative)
        script = body.decode("utf-8-sig", errors="replace")
        if len(script) < 1000:
            raise RuntimeError(f"CCBC 16 backend script is unexpectedly short: {script_name}")
        scripts[script_name] = script
        parent = parents[pid]
        parent["interactive"][f"backend_{script_name}"] = script
        parent["source_metadata"].setdefault("backend_sources", []).append({
            "key": script_name,
            "source_url": source_url,
            "raw_path": f"data/raw/{relative}",
            "bytes": len(body),
        })
    if len(scripts) != 11:
        raise RuntimeError("CCBC 16 did not yield all 11 official backend scripts")

    subrecords: list[dict[str, Any]] = []
    triddle_groups = _parse_js_declaration(scripts["c16-triddles"], "TRIDDLES")
    triddles = [
        (group_index, level_index, group, level)
        for group_index, group in enumerate(triddle_groups)
        for level_index, level in enumerate(group["levels"])
    ]
    if len(triddle_groups) != 24 or len(triddles) != 128:
        raise RuntimeError("CCBC 16 triddles count mismatch; expected 24 groups / 128 levels")
    for group_index, level_index, group, level in triddles:
        level_id = int(level["id"])
        gram = as_text(level.get("gram"))
        answer_pattern = as_text(level.get("ans"))
        if gram.endswith("字谜"):
            answer_mode = "derived_from_prior_answer_state"
        elif level_id == 21:
            answer_mode = "conditional_on_level_0"
        else:
            answer_mode = "case_insensitive_regex"
        subrecords.append(_make_c16_backend_subrecord(
            parents[46], script_name="c16-triddles", sub_id=str(level_id),
            title=f"三字谜 第 {level_id} 题", question=gram, answer=answer_pattern,
            fetched_at=fetched_at,
            metadata={
                "group_index": group_index,
                "level_index": level_index,
                "unlock_rule": group.get("next"),
                "answer_mode": answer_mode,
                "answer_pattern": answer_pattern,
                "extra": level.get("extra"),
                "is_final": bool(level.get("final")),
                "prompt_mode": "completed_count" if level_id == 90 else (
                    "answer_substitution" if re.search(r"\d", gram) else "static"
                ),
            },
        ))

    bracket_groups = _parse_js_declaration(scripts["c16-brackets"], "PUZZLES")
    active_brackets = [
        (group_index, group_position, puzzle)
        for group_index, group in enumerate(bracket_groups)
        for group_position, puzzle in enumerate(group)
    ]
    commented_brackets = []
    for match in re.finditer(
        r"(?:^|[\r\n])[ \t]*//[ \t]*(\{[ \t]*clue:[^\r\n]*?\})[ \t]*,?[ \t]*(?=[\r\n]|$)",
        scripts["c16-brackets"],
    ):
        candidate = _JSLiteralParser(match.group(1)).parse()
        if isinstance(candidate, dict) and candidate.get("id") in {506, 508}:
            commented_brackets.append(candidate)
    if len(bracket_groups) != 21 or len(active_brackets) != 190 or len(commented_brackets) != 2:
        raise RuntimeError("CCBC 16 brackets count mismatch; expected 190 active + 2 commented candidates")
    for group_index, group_position, puzzle in active_brackets:
        puzzle_id = int(puzzle["id"])
        subrecords.append(_make_c16_backend_subrecord(
            parents[48], script_name="c16-brackets", sub_id=str(puzzle_id),
            title=f"你说话带括号 第 {puzzle_id} 题", question=as_text(puzzle["clue"]),
            answer=as_text(puzzle["ans"]), fetched_at=fetched_at,
            metadata={
                "group_index": group_index,
                "group_position": group_position,
                "backend_group": puzzle.get("g"),
                "answer_mode": "exact",
                "active_in_backend": True,
                "unlock_requirement": "solved + floor(group_size / 10) + 2 >= group_size",
                "is_terminal": puzzle_id == 2000,
            },
        ))
    for puzzle in commented_brackets:
        puzzle_id = int(puzzle["id"])
        subrecords.append(_make_c16_backend_subrecord(
            parents[48], script_name="c16-brackets", sub_id=str(puzzle_id),
            title=f"你说话带括号 第 {puzzle_id} 题（源码注释候选）",
            question=as_text(puzzle["clue"]), answer=as_text(puzzle["ans"]), fetched_at=fetched_at,
            metadata={
                "group_index": puzzle.get("g"),
                "backend_group": puzzle.get("g"),
                "answer_mode": "exact",
                "active_in_backend": False,
                "commented_out_in_source": True,
            },
        ))

    tests = _parse_js_declaration(scripts["c16-puzzle-solving-test"], "PUZZLES")
    if len(tests) != 50 or {int(item["id"]) for item in tests} != set(range(1, 51)):
        raise RuntimeError("CCBC 16 puzzle-solving-test count mismatch; expected IDs 1..50")
    test_vue_url = parents[47]["interactive"].get("javascript", "")
    if not test_vue_url.endswith(".vue"):
        raise RuntimeError("CCBC 16 puzzle-solving-test Vue source is missing")
    parsed_test_vue = urlparse(test_vue_url)
    test_vue_relative = str(PurePosixPath("ccbc16/data/interactive") / PurePosixPath(parsed_test_vue.path).name)
    test_vue_body, _ = fetcher.get_raw(
        test_vue_url,
        test_vue_relative,
    )
    test_vue = test_vue_body.decode("utf-8-sig", errors="replace")
    test_images = re.findall(
        r"https://static\.cipherpuzzles\.com/static/images/[0-9a-f]+\.webp",
        test_vue,
    )
    if len(test_images) != 52 or len(set(test_images[:50])) != 50:
        raise RuntimeError("CCBC 16 puzzle-solving-test did not expose 50 ordered puzzle images")
    solution_soup = BeautifulSoup(parents[47]["solution_markdown"], "html.parser")
    test_solutions: dict[int, str] = {}
    for row in solution_soup.select("#answerkey tr"):
        cells = row.find_all(["td", "th"])
        if len(cells) != 3:
            continue
        number = cells[0].get_text(strip=True)
        if number.isdigit() and 1 <= int(number) <= 50:
            test_solutions[int(number)] = cells[2].decode_contents().strip()
    if set(test_solutions) != set(range(1, 51)):
        raise RuntimeError("CCBC 16 puzzle-solving-test official analysis does not cover IDs 1..50")
    for source_index, puzzle in enumerate(tests):
        puzzle_id = int(puzzle["id"])
        choices = list(as_text(puzzle.get("choices")))
        subrecords.append(_make_c16_backend_subrecord(
            parents[47], script_name="c16-puzzle-solving-test", sub_id=str(puzzle_id),
            title=f"2025年度解谜能力测试 第 {puzzle_id} 题", question="",
            answer=as_text(puzzle["answer"]), fetched_at=fetched_at,
            solution=test_solutions[puzzle_id], image_url=test_images[source_index],
            metadata={
                "source_index": source_index,
                "question_type": puzzle.get("type"),
                "choices": choices,
                "score": puzzle.get("score"),
                "prompt_available_in_backend": True,
                "prompt_source": "ordered PuzzleImg array in the official Vue component",
                "answer_mode": "normalized",
                "answer_normalization": "trim, uppercase, remove whitespace/hyphens/zero-width characters",
            },
        ))

    exercises = _parse_js_declaration(scripts["c16-review"], "exercises")
    if len(exercises) != 130:
        raise RuntimeError("CCBC 16 review count mismatch; expected 130 exercises")
    for source_index, exercise in enumerate(exercises):
        exercise_id = source_index + 1
        subrecords.append(_make_c16_backend_subrecord(
            parents[20], script_name="c16-review", sub_id=str(exercise_id),
            title=f"复习资料 第 {exercise_id} 题", question=as_text(exercise["problem"]),
            answer=as_text(exercise["answer"]), fetched_at=fetched_at,
            metadata={
                "source_index": source_index,
                "subject": exercise.get("subject"),
                "batch_index": source_index // 13,
                "batch_position": source_index % 13,
                "correct_message": exercise.get("correctMsg"),
                "answer_mode": "case_insensitive_exact",
                "unlock_requirement": "one solved exercise in each of five subjects in the preceding batch",
            },
        ))

    emoji_puzzles = _parse_js_declaration(scripts["c16-emoji"], "puzzles")
    if len(emoji_puzzles) != 9:
        raise RuntimeError("CCBC 16 emoji count mismatch; expected 9 puzzles")
    for source_index, puzzle in enumerate(emoji_puzzles):
        display_number = source_index + 1
        subrecords.append(_make_c16_backend_subrecord(
            parents[8], script_name="c16-emoji", sub_id=str(display_number),
            title=f"恶魔斯基 Emoji 第 {display_number} 题", question=as_text(puzzle["puz"]),
            answer=as_text(puzzle["ans"]), fetched_at=fetched_at,
            metadata={
                "source_index": source_index,
                "display_number": display_number,
                "answer_mode": "normalized",
                "answer_normalization": "remove U+FE0F variation selectors",
            },
        ))

    expected_counts = {
        "c16-triddles": 128,
        "c16-brackets": 192,
        "c16-puzzle-solving-test": 50,
        "c16-review": 130,
        "c16-emoji": 9,
    }
    actual_counts = Counter(record["source_metadata"]["script_name"] for record in subrecords)
    if actual_counts != Counter(expected_counts):
        raise RuntimeError(f"CCBC 16 backend subpuzzle count mismatch: {dict(actual_counts)}")
    for script_name, pid in C16_BACKEND_SCRIPTS.items():
        parents[pid]["source_metadata"].setdefault("backend_summary", {})[script_name] = {
            "structured_subpuzzles": actual_counts.get(script_name, 0),
            "full_script_preserved": True,
        }
    return subrecords


def load_c16_records(fetcher: Fetcher, fetched_at: str) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    supporting = [
        "main-info.json", "puzzle-basic-info.json", "library.json", "puzzle-board.json",
        "c16-qian-puzzle.json", "announcements.json", "scoreboard.json",
    ]
    raw_json: dict[str, Any] = {}
    for filename in supporting:
        url = f"{C16_ROOT}data/{filename}"
        relative = f"ccbc16/data/{filename}"
        try:
            body, _ = fetcher.get_raw(url, relative)
            raw_json[filename] = json.loads(body.decode("utf-8-sig"))
        except Exception as exc:
            fetcher.note_failure(url, "ccbc16_supporting", exc)
    info = raw_json.get("puzzle-basic-info.json", {})
    records: list[dict[str, Any]] = []
    skipped: list[dict[str, Any]] = []
    for area in info.get("puzzleAreas", []):
        for basic in area.get("puzzles") or []:
            pid = basic.get("pid")
            if not isinstance(pid, int):
                continue
            if pid >= 1000:
                skipped.append({
                    "pid": pid, "title": basic.get("title"), "reason": "navigation placeholder without puzzle JSON",
                })
                continue
            url = f"{C16_ROOT}data/puzzles/{pid}.json"
            relative = f"ccbc16/data/puzzles/{pid}.json"
            try:
                body, _ = fetcher.get_raw(url, relative)
                data = json.loads(body.decode("utf-8-sig"))
            except Exception as exc:
                fetcher.note_failure(url, "ccbc16_problem", exc)
                continue
            data.setdefault("title", basic.get("title"))
            data.setdefault("pgid", area.get("pgid"))
            data.setdefault("pg_name", area.get("title"))
            records.append(make_record(
                record_id=stable_id("ccbc16", "puzzle", pid),
                event_id="ccbc16",
                editions=["CCBC 16"],
                year=2025,
                area=as_text(data.get("pg_name") or area.get("title")),
                kind=infer_kind(as_text(data.get("title")), str(pid), data),
                source_id=str(pid),
                source_url=url,
                raw_path=f"data/raw/{relative}",
                data=data,
                fetched_at=fetched_at,
            ))
    for record in records:
        if record["source_id"] in {"101", "102", "103", "104"}:
            record["solution_status"] = "missing_official"
            record["quality"]["has_solution"] = False
    qian = raw_json.get("c16-qian-puzzle.json", [])
    parent_id = stable_id("ccbc16", "puzzle", 49)
    for item in qian:
        if item.get("cid_use") != 1 or item.get("review_status") != 4:
            continue
        cid = item.get("cid")
        title = f"千字谜子题 {cid}"
        flavor = as_text(item.get("flavor_text"))
        image_url = as_text(item.get("image_id"))
        question = flavor
        if image_url:
            question = (question + "\n\n" if question else "") + f"![题图]({image_url})"
        record = make_record(
            record_id=stable_id("ccbc16", "qian", cid),
            event_id="ccbc16",
            editions=["CCBC 16"],
            year=2025,
            area="造纸 / 千字谜",
            kind="subpuzzle",
            source_id=f"qian:{cid}",
            source_url=f"{C16_ROOT}data/c16-qian-puzzle.json#cid={cid}",
            raw_path="data/raw/ccbc16/data/c16-qian-puzzle.json",
            data=item,
            fetched_at=fetched_at,
            parent_id=parent_id,
            question_override=question,
            solution_override=as_text(item.get("analysis")),
            title_override=title,
            image_override=image_url,
        )
        # One archived entry uses an externally hosted image as the complete
        # official analysis. Mirror that core media instead of reducing it to
        # an unusable URL-only solution.
        solution_value = record["solution_markdown"].strip()
        if re.fullmatch(r"https?://\S+", solution_value, flags=re.I) and looks_like_asset(solution_value):
            record["source_metadata"]["core_external_assets"] = [solution_value]
            record["solution_status"] = "available"
            record["solution_format"] = "media_only"
            record["quality"]["has_solution"] = True
            record["quality"]["has_solution_reference"] = False
        records.append(record)
    records.extend(enrich_c16_fragments(fetcher, records, fetched_at))
    records.extend(enrich_c16_backends(fetcher, records, fetched_at))
    return records, skipped


def metadata_asset_text(
    record: dict[str, Any], *, include_core_external: bool = True,
) -> Iterable[str]:
    """Yield only explicit remote dependencies, never local provenance paths."""
    metadata = record.get("source_metadata", {})
    keys = ["dynamic_dependencies", "resolved_extend_assets"]
    if include_core_external:
        keys.append("core_external_assets")
    for key in keys:
        for value in metadata.get(key, []) or []:
            yield as_text(value)
    fragment_attributes = metadata.get("fragment_attributes") or {}
    if isinstance(fragment_attributes, dict):
        for key in ("src", "thumb"):
            yield as_text(fragment_attributes.get(key))
    yield as_text(metadata.get("runtime_thumbnail"))


def all_record_text(record: dict[str, Any]) -> Iterable[str]:
    for key in (
        "question_markdown", "extended_content_markdown", "solution_markdown", "image_url"
    ):
        yield as_text(record.get(key))
    for key, value in record.get("interactive", {}).items():
        # This component constructs its real tower path at runtime. Its bare
        # filenames are covered by the explicit dynamic dependency list.
        if record.get("source_id") == "CCBC-14/19" and key == "vue_script":
            continue
        yield as_text(value)
    yield from metadata_asset_text(record)
    for hint in record.get("hints", []):
        yield as_text(hint.get("markdown"))
    for answer in record.get("additional_answers", []):
        yield as_text(answer.get("message"))
        yield as_text(answer.get("extra"))


def asset_local_path(url: str) -> str:
    parsed = urlparse(url)
    host = parsed.hostname or "unknown-host"
    path = PurePosixPath(unquote(parsed.path).lstrip("/"))
    safe_parts = []
    for part in path.parts:
        part = re.sub(r"[^0-9A-Za-z._-]+", "_", part)
        safe_parts.append(part or "_")
    if not safe_parts:
        safe_parts = ["index"]
    filename = safe_parts[-1]
    if parsed.query or parsed.fragment:
        stem, suffix = os.path.splitext(filename)
        filename = f"{stem}-{hashlib.sha256(url.encode()).hexdigest()[:10]}{suffix}"
        safe_parts[-1] = filename
    return str(PurePosixPath("data/assets") / host / PurePosixPath(*safe_parts))


@dataclass
class AssetResult:
    url: str
    local_path: str
    status: str
    sha256: str = ""
    size: int = 0
    media_type: str = ""
    error: str = ""
    discovered_from: str = ""

    def to_dict(self) -> dict[str, Any]:
        return {
            "url": self.url,
            "local_path": self.local_path,
            "status": self.status,
            "sha256": self.sha256,
            "size": self.size,
            "media_type": self.media_type,
            "error": self.error,
            "discovered_from": self.discovered_from,
        }


def download_one_asset(fetcher: Fetcher, root: Path, url: str, discovered_from: str) -> AssetResult:
    local_rel = asset_local_path(url)
    path = root / local_rel
    if path.exists() and not fetcher.refresh:
        body = path.read_bytes()
        suffix = PurePosixPath(urlparse(url).path).suffix.lower()
        looks_like_html_fallback = body.lstrip()[:64].lower().startswith((b"<!doctype html", b"<html"))
        if body and not (looks_like_html_fallback and suffix not in {".html", ".htm"}):
            media_type = mimetypes.guess_type(path.name)[0] or "application/octet-stream"
            return AssetResult(
                url, local_rel, "cached", hashlib.sha256(body).hexdigest(), len(body),
                media_type, discovered_from=discovered_from,
            )
        with fetcher.lock:
            fetcher.stats["invalid_asset_cache_entries"] += 1
    try:
        parsed = urlparse(url)
        request_url = urlunparse((parsed.scheme, parsed.netloc, parsed.path, parsed.params, parsed.query, ""))
        response = fetcher.request(request_url)
        media_type = response.headers.get("Content-Type", "").split(";", 1)[0].lower()
        suffix = PurePosixPath(urlparse(url).path).suffix.lower()
        if not response.content:
            raise FetchError(f"Empty response for asset {url}")
        content_length = response.headers.get("Content-Length")
        if (
            content_length and content_length.isdigit()
            and not response.headers.get("Content-Encoding")
            and int(content_length) != len(response.content)
        ):
            raise FetchError(
                f"Content-Length mismatch for asset {url}: expected {content_length}, got {len(response.content)}"
            )
        if media_type == "text/html" and suffix not in {".html", ".htm"}:
            raise FetchError(f"Unexpected HTML fallback for asset {url}")
        path.parent.mkdir(parents=True, exist_ok=True)
        atomic_write_bytes(path, response.content)
        if not media_type:
            media_type = mimetypes.guess_type(path.name)[0] or "application/octet-stream"
        return AssetResult(
            url, local_rel, "downloaded", hashlib.sha256(response.content).hexdigest(),
            len(response.content), media_type, discovered_from=discovered_from,
        )
    except Exception as exc:
        fetcher.note_failure(url, "asset", exc)
        return AssetResult(url, local_rel, "failed", error=str(exc), discovered_from=discovered_from)


def collect_and_download_assets(
    fetcher: Fetcher, root: Path, records: list[dict[str, Any]], workers: int
) -> tuple[dict[str, AssetResult], dict[str, set[str]], list[dict[str, str]]]:
    queue: deque[tuple[str, str, int]] = deque()
    record_refs: dict[str, set[str]] = defaultdict(set)
    external_links: list[dict[str, str]] = []
    nested_edges: dict[str, set[str]] = defaultdict(set)
    queued: set[str] = set()
    for record in records:
        record_id = record["record_id"]
        core_external_assets = {
            normalize_url(url) for url in record["source_metadata"].get("core_external_assets", [])
        }
        for text in all_record_text(record):
            for raw, absolute in extract_url_references(text, record["source_url"], assets_only=False):
                if looks_like_asset(absolute) and (first_party(absolute) or absolute in core_external_assets):
                    record_refs[record_id].add(absolute)
                    if absolute not in queued:
                        queued.add(absolute)
                        queue.append((absolute, record_id, 0))
                elif (
                    absolute.startswith(("http://", "https://"))
                    and not first_party(absolute)
                    and absolute != record["source_url"]
                ):
                    external_links.append({"record_id": record_id, "url": absolute, "raw_reference": raw})
    results: dict[str, AssetResult] = {}
    while queue:
        batch = []
        while queue:
            batch.append(queue.popleft())
        with ThreadPoolExecutor(max_workers=workers) as pool:
            futures = {
                pool.submit(download_one_asset, fetcher, root, url, source): (url, source, depth)
                for url, source, depth in batch
            }
            for future in as_completed(futures):
                url, source, depth = futures[future]
                result = future.result()
                results[url] = result
                if result.status == "failed" or depth >= 2:
                    continue
                suffix = PurePosixPath(urlparse(url).path).suffix.lower()
                if suffix not in TEXT_ASSET_SUFFIXES:
                    continue
                path = root / result.local_path
                try:
                    text = path.read_text(encoding="utf-8-sig", errors="replace")
                except Exception:
                    continue
                for _, nested in extract_url_references(
                    text, url, assets_only=True, allow_quoted_assets=False,
                ):
                    if not first_party(nested):
                        continue
                    nested_edges[url].add(nested)
                    record_refs[source].add(nested)
                    if nested not in queued:
                        queued.add(nested)
                        queue.append((nested, source, depth + 1))
    for record_id, roots in list(record_refs.items()):
        expanded = set(roots)
        pending = list(roots)
        while pending:
            current = pending.pop()
            for nested in nested_edges.get(current, set()):
                if nested not in expanded:
                    expanded.add(nested)
                    pending.append(nested)
        record_refs[record_id] = expanded
    return results, record_refs, external_links


def rewrite_assets(text: str, base_url: str, asset_results: dict[str, AssetResult], output_file: Path, root: Path) -> str:
    replacements: list[tuple[str, str]] = []
    for raw, absolute in extract_url_references(text, base_url, assets_only=True):
        result = asset_results.get(absolute)
        if not result or result.status == "failed":
            continue
        local = root / result.local_path
        relative = os.path.relpath(local, output_file.parent).replace(os.sep, "/")
        replacements.append((raw, relative))
    replacements.sort(key=lambda item: len(item[0]), reverse=True)
    for original, replacement in replacements:
        text = text.replace(original, replacement)
    return text


def classify_record_asset_roles(record: dict[str, Any], asset_urls: set[str]) -> dict[str, set[str]]:
    """Classify record-local assets for downstream puzzle/solution separation."""
    solution_urls = {
        absolute
        for _, absolute in extract_url_references(
            record["solution_markdown"], record["source_url"], assets_only=True,
        )
        if absolute in asset_urls
    }
    solution_urls.update(
        normalize_url(url)
        for url in record["source_metadata"].get("core_external_assets", [])
        if normalize_url(url) in asset_urls
    )
    puzzle_texts = [
        record["question_markdown"], record["extended_content_markdown"], record["image_url"],
        *record["interactive"].values(),
        *metadata_asset_text(record, include_core_external=False),
        *(hint["markdown"] for hint in record["hints"]),
        *(item["message"] for item in record["additional_answers"]),
        *(item["extra"] for item in record["additional_answers"]),
    ]
    puzzle_urls = {
        absolute
        for text in puzzle_texts
        for _, absolute in extract_url_references(text, record["source_url"], assets_only=True)
        if absolute in asset_urls
    }
    roles: dict[str, set[str]] = {}
    for url in asset_urls:
        current = set()
        if url in solution_urls:
            current.add("solution")
        # Assets not directly found in the solution are puzzle-side resources,
        # including recursively discovered Vue/CSS dependencies.
        if url in puzzle_urls or url not in solution_urls:
            current.add("puzzle")
        roles[url] = current
    return roles


def write_markdown_record(record: dict[str, Any], root: Path, asset_results: dict[str, AssetResult]) -> str:
    event_dir = root / "data/processed/markdown" / record["event_id"]
    event_dir.mkdir(parents=True, exist_ok=True)
    filename = record["record_id"].replace(":", "_") + ".md"
    path = event_dir / filename
    q = rewrite_assets(record["question_markdown"], record["source_url"], asset_results, path, root)
    extended = rewrite_assets(record["extended_content_markdown"], record["source_url"], asset_results, path, root)
    solution = rewrite_assets(record["solution_markdown"], record["source_url"], asset_results, path, root)
    if record["solution_format"] == "media_only":
        raw_solution = record["solution_markdown"].strip()
        references = extract_url_references(
            raw_solution, record["source_url"], assets_only=True,
        )
        if len(references) == 1 and raw_solution in references[0]:
            result = asset_results.get(references[0][1])
            if result and result.status in {"cached", "downloaded"}:
                relative = os.path.relpath(root / result.local_path, path.parent).replace(os.sep, "/")
                suffix = PurePosixPath(urlparse(references[0][1]).path).suffix.lower()
                solution = (
                    f"![解析图]({relative})" if suffix in IMAGE_SUFFIXES
                    else f"[解析附件]({relative})"
                )
    lines = [
        "---",
        f"record_id: {json.dumps(record['record_id'], ensure_ascii=False)}",
        f"event_id: {json.dumps(record['event_id'], ensure_ascii=False)}",
        f"editions: {json.dumps(record['editions'], ensure_ascii=False)}",
        f"year: {record['year']}",
        f"area: {json.dumps(record['area'], ensure_ascii=False)}",
        f"kind: {json.dumps(record['kind'], ensure_ascii=False)}",
        f"source_url: {json.dumps(record['source_url'], ensure_ascii=False)}",
        "---",
        "",
        f"# {record['title']}",
        "",
        "## 题面",
        "",
        q or "_官方存档未提供可提取的文字题面；请查看下方附件或交互源码。_",
    ]
    if record["interactive"]:
        lines.extend(["", "## 交互源码", ""])
        for key, value in record["interactive"].items():
            rewritten = rewrite_assets(value, record["source_url"], asset_results, path, root)
            language = {"javascript": "javascript", "css": "css", "html": "html", "vue_template": "html"}.get(key, "text")
            if looks_like_asset(rewritten) and "\n" not in rewritten:
                lines.extend([f"- {key}: [{rewritten}]({rewritten})", ""])
            else:
                longest_fence = max((len(match.group(0)) for match in re.finditer(r"`+", rewritten)), default=0)
                fence = "`" * max(3, longest_fence + 1)
                lines.extend([f"### {key}", "", f"{fence}{language}", rewritten, fence, ""])
    if extended:
        lines.extend(["", "## 解题后内容", "", extended])
    lines.extend(["", "## 答案", "", f"`{record['answer']}`" if record["answer"] else "_官方存档未提供答案。_"])
    if solution:
        lines.extend(["", "## 解析", "", solution])
    else:
        lines.extend(["", "## 解析", "", "_官方存档未填写解析。_"])
    if record["hints"]:
        lines.extend(["", "## 提示", ""])
        for hint in record["hints"]:
            label = f"{hint['number']}. {hint['title']}".strip()
            body = rewrite_assets(hint["markdown"], record["source_url"], asset_results, path, root)
            lines.extend([f"### {label}", "", body, ""])
    if record["additional_answers"]:
        lines.extend(["", "## 中间答案", "", "| 提交 | 回复 | 附加信息 |", "| --- | --- | --- |"])
        for item in record["additional_answers"]:
            answer = item["answer"].replace("|", "\\|").replace("\n", "<br>")
            message = rewrite_assets(
                item["message"], record["source_url"], asset_results, path, root,
            ).replace("|", "\\|").replace("\n", "<br>")
            extra = rewrite_assets(
                item["extra"], record["source_url"], asset_results, path, root,
            ).replace("|", "\\|").replace("\n", "<br>")
            lines.append(f"| {answer} | {message} | {extra} |")
    if record["assets"]:
        lines.extend(["", "## 本地附件", ""])
        for asset in record["assets"]:
            local = root / asset["local_path"]
            relative = os.path.relpath(local, path.parent).replace(os.sep, "/")
            lines.append(f"- [{Path(asset['local_path']).name}]({relative})")
    lines.extend(["", f"来源：[{record['source_url']}]({record['source_url']})", ""])
    path.write_text("\n".join(lines), encoding="utf-8")
    return str(path.relative_to(root))


def write_outputs(
    root: Path,
    records: list[dict[str, Any]],
    asset_results: dict[str, AssetResult],
    external_links: list[dict[str, str]],
    fetcher: Fetcher,
    skipped_c16: list[dict[str, Any]],
    yaml_failures: dict[str, list[dict[str, str]]],
    generated_at: str,
    assets_skipped: bool,
    historical_metadata: dict[str, Any],
) -> dict[str, Any]:
    processed = root / "data/processed"
    if processed.exists():
        shutil.rmtree(processed)
    (processed / "markdown").mkdir(parents=True, exist_ok=True)
    for record in records:
        asset_urls = set(record.pop("_asset_urls", []))
        asset_roles = classify_record_asset_roles(record, asset_urls)
        record["assets"] = [
            {**asset_results[url].to_dict(), "roles": sorted(asset_roles[url])}
            for url in sorted(asset_urls)
            if url in asset_results
            if asset_results[url].status != "failed"
        ]
        record["failed_assets"] = [
            asset_results[url].to_dict()
            for url in sorted(asset_urls)
            if url in asset_results and asset_results[url].status == "failed"
        ]
        record["markdown_path"] = write_markdown_record(record, root, asset_results)
    records.sort(key=lambda item: (item["year"], item["event_id"], item["area"], item["source_id"]))
    with (processed / "records.jsonl").open("w", encoding="utf-8") as handle:
        for record in records:
            handle.write(json.dumps(record, ensure_ascii=False) + "\n")
    pair_count = 0
    with (processed / "puzzle_solution_pairs.jsonl").open("w", encoding="utf-8") as handle:
        for record in records:
            if not record["quality"]["has_solution"]:
                continue
            if not record["quality"].get("pair_eligible", False):
                continue
            has_puzzle_signal = bool(
                record["question_markdown"]
                or record["extended_content_markdown"]
                or record["interactive"]
                or any("puzzle" in asset.get("roles", []) for asset in record["assets"])
                or record["content_format"] == "title_only"
            )
            if not has_puzzle_signal:
                raise RuntimeError(f"Solution pair has no usable puzzle signal: {record['record_id']}")
            pair = {
                "id": record["record_id"],
                "metadata": {
                    "event_id": record["event_id"], "editions": record["editions"], "year": record["year"],
                    "area": record["area"], "kind": record["kind"], "title": record["title"],
                    "authors": record["authors"], "source_url": record["source_url"],
                    "content_format": record["content_format"],
                    "content_status": record["content_status"],
                },
                "puzzle": {
                    "markdown": record["question_markdown"], "text": record["question_text"],
                    "extended_markdown": record["extended_content_markdown"],
                    "interactive": record["interactive"],
                    "hints": record["hints"],
                    "additional_answers": record["additional_answers"],
                    "assets": [
                        {"url": a["url"], "local_path": a["local_path"]}
                        for a in record["assets"] if "puzzle" in a.get("roles", [])
                    ],
                    "failed_assets": record["failed_assets"],
                },
                "solution": {
                    "answer": record["answer"], "markdown": record["solution_markdown"], "text": record["solution_text"],
                    "assets": [
                        {"url": a["url"], "local_path": a["local_path"]}
                        for a in record["assets"] if "solution" in a.get("roles", [])
                    ],
                },
            }
            handle.write(json.dumps(pair, ensure_ascii=False) + "\n")
            pair_count += 1
    solution_references = []
    for record in records:
        parent_solution_id = record["source_metadata"].get("solution_reference_record_id")
        if record["solution_status"] != "available_via_parent":
            continue
        solution_references.append({
            "id": record["record_id"],
            "parent_solution_id": parent_solution_id,
            "relation": "official_solution_available_on_parent_record",
        })
    with (processed / "solution_references.jsonl").open("w", encoding="utf-8") as handle:
        for reference in solution_references:
            handle.write(json.dumps(reference, ensure_ascii=False) + "\n")
    csv_fields = [
        "record_id", "event_id", "editions", "year", "area", "kind", "parent_id", "source_id", "title",
        "authors", "answer", "content_status", "content_format", "solution_status",
        "solution_reference_record_id", "has_question", "has_solution", "has_hints", "asset_count",
        "question_chars", "solution_chars", "source_url", "raw_path", "markdown_path",
    ]
    with (processed / "index.csv").open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=csv_fields)
        writer.writeheader()
        for record in records:
            writer.writerow({
                "record_id": record["record_id"], "event_id": record["event_id"],
                "editions": " | ".join(record["editions"]), "year": record["year"], "area": record["area"],
                "kind": record["kind"], "parent_id": record["parent_id"] or "", "source_id": record["source_id"],
                "title": record["title"], "authors": " | ".join(record["authors"]), "answer": record["answer"],
                "content_status": record["content_status"], "content_format": record["content_format"],
                "solution_status": record["solution_status"],
                "solution_reference_record_id": record["source_metadata"].get("solution_reference_record_id", ""),
                "has_question": record["quality"]["has_question"], "has_solution": record["quality"]["has_solution"],
                "has_hints": record["quality"]["has_hints"], "asset_count": len(record["assets"]),
                "question_chars": len(record["question_text"]), "solution_chars": len(record["solution_text"]),
                "source_url": record["source_url"], "raw_path": record["raw_path"],
                "markdown_path": record["markdown_path"],
            })
    dedup_external = {(item["record_id"], item["url"]): item for item in external_links}
    with (processed / "external_links.csv").open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=["record_id", "url", "raw_reference"])
        writer.writeheader()
        writer.writerows(sorted(dedup_external.values(), key=lambda item: (item["record_id"], item["url"])))
    event_counts = Counter(record["event_id"] for record in records)
    kind_counts = Counter(record["kind"] for record in records)
    missing_solution = [record for record in records if record["solution_status"] == "missing_official"]
    external_solution = [record for record in records if record["solution_status"] == "external_only"]
    missing_question = [record for record in records if not record["quality"]["has_question"]]
    incomplete_question = [record for record in records if record["content_status"] == "incomplete_official"]
    answer_only = [record for record in records if record["solution_status"] == "answer_only"]
    solution_without_question = [
        record for record in records if record["solution_status"] == "available_without_question"
    ]
    successful_assets = [result for result in asset_results.values() if result.status != "failed"]
    failed_assets = [result for result in asset_results.values() if result.status == "failed"]
    orphan_assets_removed = 0
    if not assets_skipped:
        asset_root = root / "data/assets"
        expected_asset_paths = {
            (root / result.local_path).resolve() for result in successful_assets
        }
        if asset_root.exists():
            for path in sorted(asset_root.rglob("*")):
                if path.is_file() and path.resolve() not in expected_asset_paths:
                    path.unlink()
                    orphan_assets_removed += 1
            for path in sorted(asset_root.rglob("*"), reverse=True):
                if path.is_dir():
                    try:
                        path.rmdir()
                    except OSError:
                        pass
    with (processed / "assets.jsonl").open("w", encoding="utf-8") as handle:
        for result in sorted(asset_results.values(), key=lambda item: item.url):
            handle.write(json.dumps(result.to_dict(), ensure_ascii=False) + "\n")
    with (processed / "raw_files.jsonl").open("w", encoding="utf-8") as handle:
        for path in sorted((root / "data/raw").rglob("*")):
            if not path.is_file():
                continue
            body = path.read_bytes()
            handle.write(json.dumps({
                "path": str(path.relative_to(root)),
                "bytes": len(body),
                "sha256": hashlib.sha256(body).hexdigest(),
            }, ensure_ascii=False) + "\n")
    manifest = {
        "schema_version": "1.0",
        "generated_at": generated_at,
        "scope": ["CCBC 2", "CCBC 3", "CCBC 4", "CCBC 11", "CCBC 12", "CCBC 13/14", "CCBC 15", "CCBC 16"],
        "record_count": len(records),
        "pair_count": pair_count,
        "solution_reference_count": len(solution_references),
        "records_by_event": dict(sorted(event_counts.items())),
        "records_by_kind": dict(sorted(kind_counts.items())),
        "solution_status_counts": dict(sorted(Counter(record["solution_status"] for record in records).items())),
        "content_format_counts": dict(sorted(Counter(record["content_format"] for record in records).items())),
        "records_missing_question": len(missing_question),
        "records_incomplete_question": len(incomplete_question),
        "records_missing_solution": len(missing_solution),
        "records_external_solution_only": len(external_solution),
        "records_answer_only": len(answer_only),
        "records_solution_without_question": len(solution_without_question),
        "asset_count": len(successful_assets),
        "asset_bytes": sum(result.size for result in successful_assets),
        "failed_asset_count": len(failed_assets),
        "orphan_asset_files_removed": orphan_assets_removed,
        "records_complete": True,
        "asset_mode": "skipped" if assets_skipped else "downloaded",
        "assets_complete": False if assets_skipped else not failed_assets,
        "corpus_complete": False if assets_skipped else not failed_assets,
        "source_content_complete": False,
        "external_link_count": len(dedup_external),
        "raw_file_count": sum(1 for path in (root / "data/raw").rglob("*") if path.is_file()),
        "fetch_stats": dict(fetcher.stats),
        "known_exclusions": {
            "ccbc1": "The surviving official announcement does not contain the full puzzle set and solutions.",
            "ccbc5": "The surviving official repost explicitly omits interactive puzzles and has no complete official solutions.",
            "ccbc6_to_10": "No currently retrievable complete official puzzle-and-solution corpus was found; CCBC X only has a broken archive index.",
            "ccbc16_navigation_placeholders": skipped_c16,
        },
        "historical_recovery": historical_metadata,
        "discovery_failures": yaml_failures,
        "download_failures": fetcher.failures,
    }
    json_dump(manifest, processed / "manifest.json")
    report = [
        "# CCBC 语料质量报告", "", f"生成时间：`{generated_at}`", "",
        "## 汇总", "",
        f"- 规范化记录：{len(records)}", f"- 有官方解析的题解对：{pair_count}",
        f"- 本地附件：{len(successful_assets)} 个，{sum(r.size for r in successful_assets) / 1024 / 1024:.2f} MiB",
        f"- 附件下载失败：{len(failed_assets)}", f"- 外部链接（仅编目、不镜像）：{len(dedup_external)}", "",
        "## 按赛事", "",
        "| 赛事 | 记录数 |", "| --- | ---: |",
    ]
    report.extend(f"| {event} | {count} |" for event, count in sorted(event_counts.items()))
    report.extend(["", "## 按类型", "", "| 类型 | 记录数 |", "| --- | ---: |"])
    report.extend(f"| {kind} | {count} |" for kind, count in sorted(kind_counts.items()))
    report.extend([
        "", "## 官方缺失项", "",
        f"无可提取题面：{len(missing_question)}；题面存在但官方媒体/输入已缺：{len(incomplete_question)}；"
        f"官方未填写解析：{len(missing_solution)}；仅有答案：{len(answer_only)}；"
        f"仅有外部解析链接：{len(external_solution)}；官解尚存但题面已删：{len(solution_without_question)}。",
        "",
    ])
    if missing_solution:
        report.extend(["| ID | 标题 | 答案 |", "| --- | --- | --- |"])
        for record in missing_solution:
            escaped_title = record["title"].replace("|", "\\|")
            escaped_answer = record["answer"].replace("|", "\\|")
            report.append(f"| {record['record_id']} | {escaped_title} | {escaped_answer} |")
    report.extend([
        "", "## 范围说明", "",
        "- CCBC 2–4 来自主办方早期官方贴吧帖。平台已删除部分楼层和旧图，因此这些记录属于历史恢复层，并逐题标注缺题面、缺媒体、仅答案或缺官解。",
        "- CCBC 1、5–10 当前没有可恢复的完整官方题目与解析；其中 CCBC X（10）的官方索引仍可读取，但全部内容链接为 404，因此未用第三方题解冒充官方原文。",
        "- CCBC 16 中 18 个标题为 `█████`、PID 为 1001–1018 的对象仅是地图导航占位符，站点未提供对应题目 JSON，未计作独立谜题。",
        "- 外部站点一般只保留 URL；CCBC 15 的公开腾讯官解入口另保存页面及可取得的数据快照。CCBC 16 千字谜中一条以外站图片作为完整官解的记录也已镜像该核心图片。官方存档与官方静态资源域名内的附件已本地化。",
        "- `千字谜` 子题按存档前端的公开条件 `cid_use == 1 && review_status == 4` 纳入，并通过 `parent_id` 关联主谜题。",
    ])
    (processed / "QUALITY_REPORT.md").write_text("\n".join(report) + "\n", encoding="utf-8")
    return manifest


def validate_completeness(records: list[dict[str, Any]]) -> dict[str, int]:
    by_event = defaultdict(list)
    for record in records:
        by_event[record["event_id"]].append(record)
    primary_counts = {
        "ccbc2": len(by_event["ccbc2"]),
        "ccbc3": len(by_event["ccbc3"]),
        "ccbc4": len(by_event["ccbc4"]),
        "ccbc11": len(by_event["ccbc11"]),
        "ccbc12": sum(record["kind"] != "subpuzzle" for record in by_event["ccbc12"]),
        "ccbc12_loopstage": sum(record["kind"] == "subpuzzle" for record in by_event["ccbc12"]),
        "ccbc13-14": len(by_event["ccbc13-14"]),
        "ccbc15": len(by_event["ccbc15"]),
        "ccbc16": sum(record["source_id"].isdigit() for record in by_event["ccbc16"]),
        "ccbc16_qian": sum(record["source_id"].startswith("qian:") for record in by_event["ccbc16"]),
    }
    expected = {
        "ccbc2": 14,
        "ccbc3": 41,
        "ccbc4": 32,
        "ccbc11": 40,
        "ccbc12": 68,
        "ccbc12_loopstage": 24,
        "ccbc13-14": 123,
        "ccbc15": 75,
        "ccbc16": 59,
        "ccbc16_qian": 454,
    }
    if primary_counts != expected:
        raise RuntimeError(f"Corpus completeness mismatch: actual={primary_counts}, expected={expected}")

    c12_records = by_event["ccbc12"]
    c12_parents = {record["source_id"]: record for record in c12_records}
    loop_parent = c12_parents["ccbc12/pages/loopstage_main"]
    loop_children = [record for record in c12_records if record["kind"] == "subpuzzle"]
    if {record["parent_id"] for record in loop_children} != {loop_parent["record_id"]}:
        raise RuntimeError("CCBC 12 loopstage parent linkage mismatch")
    if {record["source_metadata"].get("sequence_number") for record in loop_children} != set(range(1, 25)):
        raise RuntimeError("CCBC 12 loopstage sequence mismatch")
    for component_name, config in C12_COMPONENTS.items():
        parent = c12_parents[config["parent_source_id"]]
        if not parent["interactive"].get(f"component_{component_name}"):
            raise RuntimeError(f"CCBC 12 component source missing: {component_name}")
        sources = parent["source_metadata"].get("component_sources", [])
        if not any(source.get("name") == component_name for source in sources):
            raise RuntimeError(f"CCBC 12 component provenance missing: {component_name}")
    c12_final_meta = [record for record in c12_records if record["kind"] == "final_meta"]
    if len(c12_final_meta) != 1 or c12_final_meta[0]["source_id"] != "ccbc12/problems/mm":
        raise RuntimeError("CCBC 12 final meta classification mismatch")

    c16_pids = {
        int(record["source_id"])
        for record in by_event["ccbc16"]
        if record["source_id"].isdigit()
    }
    expected_c16_pids = set(range(1, 56)) | {101, 102, 103, 104}
    if c16_pids != expected_c16_pids:
        raise RuntimeError(f"CCBC 16 PID mismatch: {sorted(c16_pids ^ expected_c16_pids)}")
    all_ids = {record["record_id"] for record in records}
    dangling_parents = sorted({
        record["parent_id"] for record in records
        if record["parent_id"] and record["parent_id"] not in all_ids
    })
    if dangling_parents:
        raise RuntimeError(f"Dangling parent IDs: {dangling_parents[:10]}")
    valid_content_statuses = {"available", "incomplete_official", "missing_official"}
    invalid_content_status = [
        record["record_id"] for record in records
        if record["content_status"] not in valid_content_statuses
    ]
    if invalid_content_status:
        raise RuntimeError(f"Invalid content status: {invalid_content_status[:10]}")
    inconsistent_content = [
        record["record_id"] for record in records
        if record["quality"]["has_question"] != (record["content_status"] != "missing_official")
    ]
    if inconsistent_content:
        raise RuntimeError(f"Inconsistent content status: {inconsistent_content[:10]}")
    inconsistent_format = [
        record["record_id"] for record in records
        if (record["content_status"] != "missing_official") == (record["content_format"] == "missing")
    ]
    if inconsistent_format:
        raise RuntimeError(f"Inconsistent content format: {inconsistent_format[:10]}")
    inconsistent_pair_eligibility = [
        record["record_id"] for record in records
        if record["quality"].get("pair_eligible", False) != (
            record["content_status"] == "available"
            and record["solution_status"] == "available"
            and record["quality"]["has_solution"]
        )
    ]
    if inconsistent_pair_eligibility:
        raise RuntimeError(
            f"Inconsistent pair eligibility: {inconsistent_pair_eligibility[:10]}"
        )

    c13_status = Counter(record["solution_status"] for record in by_event["ccbc13-14"])
    if c13_status != Counter({"missing_official": 88, "available": 35}):
        raise RuntimeError(f"CCBC 13/14 solution status mismatch: {dict(c13_status)}")
    c15_status = Counter(record["solution_status"] for record in by_event["ccbc15"])
    if c15_status != Counter({"available": 62, "external_only": 7, "missing_official": 6}):
        raise RuntimeError(f"CCBC 15 solution status mismatch: {dict(c15_status)}")
    c16_primary = [record for record in by_event["ccbc16"] if record["source_id"].isdigit()]
    empty_c16 = {int(record["source_id"]) for record in c16_primary if not record["quality"]["has_question"]}
    expected_empty_c16 = {101, 102, 103, 104}
    if empty_c16 != expected_empty_c16:
        raise RuntimeError(
            f"CCBC 16 content status mismatch: actual={sorted(empty_c16)}, "
            f"expected={sorted(expected_empty_c16)}"
        )
    c16_status = Counter(record["solution_status"] for record in c16_primary)
    if c16_status != Counter({"available": 55, "missing_official": 4}):
        raise RuntimeError(f"CCBC 16 solution status mismatch: {dict(c16_status)}")
    qian_records = [record for record in by_event["ccbc16"] if record["source_id"].startswith("qian:")]
    if Counter(record["solution_status"] for record in qian_records) != Counter({
        "available": 407,
        "missing_official": 47,
    }):
        raise RuntimeError("CCBC 16 qian solution status mismatch")
    return primary_counts


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--refresh", action="store_true", help="redownload files already in data/raw and data/assets")
    parser.add_argument("--workers", type=int, default=8, help="parallel first-party asset downloads")
    parser.add_argument("--no-assets", action="store_true", help="skip first-party asset downloads (metadata still generated)")
    args = parser.parse_args()
    root = args.root.resolve()
    raw_root = root / "data/raw"
    raw_root.mkdir(parents=True, exist_ok=True)
    fetched_at = utc_now()
    fetcher = Fetcher(raw_root, refresh=args.refresh)
    records: list[dict[str, Any]] = []
    yaml_failures: dict[str, list[dict[str, str]]] = {}

    historical_records, historical_metadata = load_historical_tieba_records(
        raw_root=raw_root,
        refresh=args.refresh,
        atomic_write=atomic_write_bytes,
        make_record=make_record,
        stable_id=stable_id,
        fetched_at=fetched_at,
    )
    records.extend(historical_records)
    # CCBC X is probed for provenance, but its linked archive files are currently gone.
    c10_docs, c10_failures = load_yaml_archive(fetcher, 10)
    yaml_failures["ccbc10"] = c10_failures
    records.extend(build_yaml_records(c10_docs, 10, fetched_at))
    for edition in (11, 12, 15):
        documents, failures = load_yaml_archive(fetcher, edition)
        yaml_failures[f"ccbc{edition}"] = failures
        edition_records = build_yaml_records(documents, edition, fetched_at)
        if edition == 12:
            edition_records.extend(enrich_c12_records(fetcher, edition_records, fetched_at))
        elif edition == 15:
            enrich_c15_records(fetcher, edition_records)
        records.extend(edition_records)
    records.extend(load_c13_records(fetcher, fetched_at))
    c16_records, skipped_c16 = load_c16_records(fetcher, fetched_at)
    records.extend(c16_records)

    # Several enrichers recover a title-only prompt, fragments, or a media-only
    # official solution after make_record has produced its initial quality flags.
    # Derive training-pair eligibility once, from the finalized record state.
    for record in records:
        record["quality"]["pair_eligible"] = (
            record["content_status"] == "available"
            and record["solution_status"] == "available"
            and record["quality"]["has_solution"]
        )

    primary_counts = validate_completeness(records)
    print(f"Validated official puzzle counts: {json.dumps(primary_counts, ensure_ascii=False)}", file=sys.stderr)

    ids = [record["record_id"] for record in records]
    duplicate_ids = [item for item, count in Counter(ids).items() if count > 1]
    if duplicate_ids:
        raise RuntimeError(f"Duplicate record IDs: {duplicate_ids[:10]}")

    asset_results: dict[str, AssetResult] = {}
    external_links: list[dict[str, str]] = []
    if not args.no_assets:
        asset_results, record_refs, external_links = collect_and_download_assets(
            fetcher, root, records, max(1, args.workers)
        )
        for record in records:
            record["_asset_urls"] = sorted(record_refs.get(record["record_id"], set()))
    else:
        for record in records:
            for text in all_record_text(record):
                for raw, absolute in extract_url_references(text, record["source_url"], assets_only=False):
                    if absolute.startswith(("http://", "https://")) and not first_party(absolute):
                        external_links.append({"record_id": record["record_id"], "url": absolute, "raw_reference": raw})
            record["_asset_urls"] = []

    manifest = write_outputs(
        root, records, asset_results, external_links, fetcher, skipped_c16, yaml_failures, fetched_at,
        args.no_assets, historical_metadata,
    )
    print(json.dumps({
        "record_count": manifest["record_count"], "pair_count": manifest["pair_count"],
        "asset_count": manifest["asset_count"], "failed_asset_count": manifest["failed_asset_count"],
        "corpus_complete": manifest["corpus_complete"],
        "records_by_event": manifest["records_by_event"],
    }, ensure_ascii=False, indent=2))
    if not args.no_assets and not manifest["corpus_complete"]:
        return 2
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
