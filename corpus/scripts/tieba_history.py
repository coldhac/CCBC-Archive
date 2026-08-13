"""Recover the surviving official CCBC 2-4 Tieba posts.

The generated protobuf bindings in ``tieba_pb`` come from aiotieba's public
domain protocol definitions.  This module deliberately keeps the recovery
layer separate from the modern archive loaders: old deleted posts and images
are represented as explicit gaps instead of being treated as a complete site.
"""

from __future__ import annotations

import re
import threading
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Callable

import requests

try:
    from tieba_pb import PbPageReqIdl_pb2, PbPageResIdl_pb2
except ImportError:
    from .tieba_pb import PbPageReqIdl_pb2, PbPageResIdl_pb2


TIEBA_API = "https://tiebac.baidu.com/c/f/pb/page?cmd=302001"
PROTOCOL_SOURCE = "https://github.com/lumina37/aiotieba/tree/bae68256fd250d5178e1447899ffa155c77eda38"
THREAD_URL = "https://tieba.baidu.com/p/{tid}?see_lz=1"
APP_VERSION = "12.64.1.1"
OFFICIAL_AUTHOR_IDS = {6051179, 79486337, 115104274, 221238930}
TEXT_TYPES = {0, 9, 18, 27, 40}
IMAGE_TYPES = {3, 20}

THREADS = {
    "c2_questions": 619770728,
    "c2_solutions": 626759569,
    "c3_questions": 853440395,
    "c3_announcements": 854239358,
    "c3_solutions": 868099569,
    "c3_meta": 848419725,
    "c3_index": 870660395,
    "c4_act1": 1165694441,
    "c4_act2_upper": 1173852788,
    "c4_act2_lower": 1181018380,
    "c4_solutions": 1183192809,
    "c4_index": 1183087886,
}

C2_ANSWERS = {
    1: "KISMET", 2: "JACK SPARROW", 3: "", 4: "MAELSTROM", 5: "SAIL",
    6: "", 7: "THUNDERSTORM", 8: "PLUNDER", 9: "AZTEC CURSE",
    10: "INTL DATE LINE", 11: "", 12: "RAPIER", 13: "ASTROLABE",
}
C2_SOLUTION_FLOORS = {1: 3, 2: 4, 4: 6, 5: 7, 7: 9, 8: 10, 9: 11, 10: 12, 12: 14, 13: 15}
C2_TITLES = {
    1: "海盗・咒语", 2: "海盗・纸牌", 3: "海盗・岛屿", 4: "海盗・海图",
    5: "海盗・折纸", 6: "海盗・星图", 7: "海盗・暴风雨", 8: "海盗・钱币",
    9: "海盗・诅咒", 10: "海盗・时区", 11: "海盗・乐谱", 12: "海盗・棋盘",
    13: "海盗・建筑",
}
C2_MISSING_MEDIA = {2, 3, 5, 6, 8, 9, 10, 11, 12, 13}
C2_QUESTION_FLOORS = {
    1: 5, 2: 378, 3: 379, 4: 380, 5: 382, 6: 383, 7: 384,
    8: 385, 9: 386, 10: None, 11: 389, 12: 390, 13: 391,
}

C3_ANSWERS = [
    "Grand Union Flag", "Slovenia", "Cameroon", "Montevideo", "SambaHeggae",
    "Bratislava", "Honduras", "stick", "Wellington", "Oktoberfest", "Tulipa",
    "Athena", "collier", "Laurent Gbagbo", "Leonardo da Vinci", "kangaroo",
    "Mexico", "Xabi Alonso", "Rui costa", "Chilavert", "Nigeria", "Algeria",
    "Andersen", "Barack Hussein Obama", "Elimina Castle", "intelligence",
    "Jugoslavia", "La Tour Eiffel", "Mandela", "Maradona", "Red Cross", "sakura",
]
C3_GROUP_NAMES = [
    "英格兰", "斯洛文尼亚", "喀麦隆", "乌拉圭", "巴西", "斯洛伐克", "洪都拉斯", "韩国",
    "新西兰", "德国", "荷兰", "希腊", "朝鲜", "科特迪瓦", "意大利", "澳大利亚", "墨西哥",
    "西班牙", "葡萄牙", "巴拉圭", "尼日利亚", "阿尔及利亚", "丹麦", "美国", "加纳", "智利",
    "塞尔维亚", "法国", "南非", "阿根廷", "瑞士", "日本",
]
C3_SECOND_ROUND_FLOORS = {1: 39, 2: 39, 3: 43, 4: 43, 5: 49, 6: 49, 7: 50, 8: 50}
C3_QUESTION_FLOORS = (4, 7, 9)

C4_ACT1_ANSWERS = {
    9: "gemini", 10: "pyrrhic", 11: "rainier", 12: "scholarship",
    13: "scripture", 14: "uncopyrightable", 15: "talisman", 16: "trilogy",
}


@dataclass
class ThreadSnapshot:
    key: str
    tid: int
    title: str
    raw_paths: list[str]
    posts: dict[int, Any]
    visible_post_count: int


def _request_page(session: requests.Session, tid: int, page_number: int, only_author: bool) -> bytes:
    request = PbPageReqIdl_pb2.PbPageReqIdl()
    request.data.common._client_type = 2
    request.data.common._client_version = APP_VERSION
    request.data.kz = tid
    request.data.pn = page_number
    request.data.rn = 30
    request.data.r = 0
    request.data.lz = int(only_author)
    last_error: Exception | None = None
    for attempt in range(7):
        try:
            response = session.post(
                TIEBA_API,
                files={"data": ("file", request.SerializeToString(), "application/octet-stream")},
                headers={
                    "User-Agent": "CCBCArchiveCorpusBuilder/1.0 (historical official-post recovery)",
                    "x_bd_data_type": "protobuf",
                    "Accept-Encoding": "gzip",
                },
                timeout=(15, 90),
            )
            if response.status_code == 429 or 500 <= response.status_code < 600:
                retry_after = response.headers.get("Retry-After", "")
                delay = float(retry_after) if retry_after.isdigit() else min(32.0, 2.0 ** attempt)
                last_error = RuntimeError(
                    f"Tieba HTTP {response.status_code}: tid={tid}, page={page_number}"
                )
                if attempt < 6:
                    time.sleep(delay)
                    continue
            response.raise_for_status()
            if not response.content:
                raise RuntimeError(f"Empty Tieba protobuf response: tid={tid}, page={page_number}")
            return response.content
        except requests.RequestException as exc:
            last_error = exc
            if attempt < 6:
                time.sleep(min(32.0, 2.0 ** attempt))
                continue
    raise RuntimeError(
        f"Failed to fetch Tieba protobuf after retries: tid={tid}, page={page_number}"
    ) from last_error


def fetch_thread(
    raw_root: Path, key: str, tid: int, refresh: bool,
    atomic_write: Callable[[Path, bytes], None], only_author: bool = False,
) -> ThreadSnapshot:
    session = requests.Session()
    posts: dict[int, Any] = {}
    all_post_ids: set[int] = set()
    raw_paths: list[str] = []
    title = ""
    page_number = 1
    while True:
        view = "author" if only_author else "all"
        relative = f"ccbc-history/tieba/{tid}/{view}/page-{page_number}.pb"
        path = raw_root / relative
        if path.exists() and not refresh:
            body = path.read_bytes()
            if not body:
                body = _request_page(session, tid, page_number, only_author)
                atomic_write(path, body)
        else:
            body = _request_page(session, tid, page_number, only_author)
            atomic_write(path, body)
            time.sleep(0.8)
        response = PbPageResIdl_pb2.PbPageResIdl()
        try:
            response.ParseFromString(body)
        except Exception as exc:
            if refresh:
                raise RuntimeError(f"Invalid Tieba protobuf cache {path}") from exc
            body = _request_page(session, tid, page_number, only_author)
            atomic_write(path, body)
            response.ParseFromString(body)
        if response.error.errorno:
            raise RuntimeError(
                f"Tieba error {response.error.errorno} for {tid}: {response.error.errmsg}"
            )
        if response.data.thread.id != tid:
            raise RuntimeError(f"Tieba thread mismatch: requested {tid}, got {response.data.thread.id}")
        if response.data.page.current_page != page_number:
            raise RuntimeError(f"Tieba page mismatch for {tid}: requested {page_number}")
        title = response.data.thread.title
        for post in response.data.post_list:
            all_post_ids.add(post.id)
            if only_author or post.author_id in OFFICIAL_AUTHOR_IDS:
                posts[post.floor] = post
        raw_paths.append(f"data/raw/{relative}")
        if not response.data.page.has_more:
            break
        page_number += 1
        if page_number > 50:
            raise RuntimeError(f"Tieba pagination runaway for {tid}")
    return ThreadSnapshot(key, tid, title, raw_paths, posts, len(all_post_ids))


def _image_url(fragment: Any) -> str:
    return fragment.origin_src or fragment.big_cdn_src or fragment.cdn_src or fragment.src


def render_fragments(post: Any) -> str:
    parts: list[str] = []
    for fragment in post.content:
        if fragment.type in TEXT_TYPES:
            parts.append(fragment.text.replace("\x18", ""))
        elif fragment.type == 1:
            target = fragment.link or fragment.text
            parts.append(f"[{fragment.text or target}]({target})")
        elif fragment.type in IMAGE_TYPES:
            url = _image_url(fragment)
            if url:
                parts.append(f"\n\n![官方原图]({url})\n\n")
    return "".join(parts).strip()


def _split_numbered(text: str, start: int, end: int) -> dict[int, tuple[str, str]]:
    pattern = re.compile(
        r"(?m)(?<![0-9])(" + "|".join(str(number) for number in range(start, end + 1)) + r")[、.．]\s*"
    )
    matches = list(pattern.finditer(text))
    result: dict[int, tuple[str, str]] = {}
    for index, match in enumerate(matches):
        number = int(match.group(1))
        stop = matches[index + 1].start() if index + 1 < len(matches) else len(text)
        block = text[match.end():stop].strip()
        title, _, body = block.partition("\n")
        result[number] = (title.strip() or f"题目 {number}", body.strip())
    return result


def _split_rooms(text: str) -> dict[int, str]:
    matches = list(re.finditer(r"【房间\s*([0-9]+)】", text))
    result: dict[int, str] = {}
    for index, match in enumerate(matches):
        stop = matches[index + 1].start() if index + 1 < len(matches) else len(text)
        result[int(match.group(1))] = text[match.end():stop].strip()
    return result


def _historical_record(
    make_record: Callable[..., dict[str, Any]], stable_id: Callable[..., str], fetched_at: str,
    *, edition: int, source_id: str, area: str, kind: str, title: str, question: str,
    answer: str = "", solution: str = "", source_tid: int, raw_paths: list[str],
    content_status: str | None = None, content_format: str | None = None,
    solution_status: str | None = None, recovery_notes: list[str] | None = None,
    extra_metadata: dict[str, Any] | None = None,
) -> dict[str, Any]:
    record = make_record(
        record_id=stable_id(f"ccbc{edition}", source_id), event_id=f"ccbc{edition}",
        editions=[f"CCBC {edition}"], year={2: 2009, 3: 2010, 4: 2011}[edition],
        area=area, kind=kind, source_id=source_id,
        source_url=THREAD_URL.format(tid=source_tid), raw_path=raw_paths[0],
        data={"title": title, "content": question, "answer": answer, "answer-analysis": solution},
        fetched_at=fetched_at,
    )
    if content_status:
        record["content_status"] = content_status
        record["quality"]["has_question"] = content_status != "missing_official"
    if content_format:
        record["content_format"] = content_format
    if solution_status:
        record["solution_status"] = solution_status
        record["quality"]["has_solution"] = solution_status in {
            "available", "available_without_question",
        }
    record["source_metadata"].update({
        "historical_recovery": True,
        "official_thread_id": source_tid,
        "raw_page_paths": raw_paths,
        "recovery_notes": recovery_notes or [],
        "missing_media": content_format == "text_missing_media",
        "missing_inputs": content_format == "text_missing_inputs",
    })
    if extra_metadata:
        record["source_metadata"].update(extra_metadata)
    record["quality"]["pair_eligible"] = (
        record["content_status"] == "available" and record["solution_status"] == "available"
    )
    return record


def _solution_provenance(snapshot: ThreadSnapshot) -> dict[str, Any]:
    return {
        "official_solution_thread_id": snapshot.tid,
        "official_solution_url": THREAD_URL.format(tid=snapshot.tid),
    }


def _load_c2(snapshots: dict[str, ThreadSnapshot], make_record: Callable[..., dict[str, Any]], stable_id: Callable[..., str], fetched_at: str) -> list[dict[str, Any]]:
    questions = snapshots["c2_questions"]
    solutions = snapshots["c2_solutions"]
    records = []
    for number, floor in C2_QUESTION_FLOORS.items():
        question = render_fragments(questions.posts[floor]) if floor in questions.posts else ""
        solution_floor = C2_SOLUTION_FLOORS.get(number)
        solution = render_fragments(solutions.posts[solution_floor]) if solution_floor in solutions.posts else ""
        notes = []
        if number == 10:
            notes.append("The original Entry 10 post is deleted; no official question text survives in the thread.")
            question = ""
        if number in C2_MISSING_MEDIA:
            notes.append("The surviving official prose refers to an image or object that is no longer present in the post.")
        record = _historical_record(
            make_record, stable_id, fetched_at, edition=2, source_id=f"puzzle-{number:02d}",
            area="航海日记", kind="puzzle", title=C2_TITLES[number], question=question,
            answer=C2_ANSWERS[number], solution=solution, source_tid=questions.tid,
            raw_paths=questions.raw_paths + solutions.raw_paths,
            content_status="missing_official" if not question else ("incomplete_official" if number in C2_MISSING_MEDIA else "available"),
            content_format="missing" if not question else ("text_missing_media" if number in C2_MISSING_MEDIA else "text"),
            solution_status=(
                "available" if solution and question
                else "available_without_question" if solution
                else "missing_official"
            ),
            recovery_notes=notes,
            extra_metadata={
                "question_floor": floor,
                "solution_floor": solution_floor,
                **_solution_provenance(solutions),
            },
        )
        record["quality"]["has_question"] = bool(question)
        records.append(record)
    meta_question = "\n\n".join(
        render_fragments(questions.posts[floor])
        for floor in C2_QUESTION_FLOORS.values() if floor in questions.posts
    )
    meta_solution = render_fragments(solutions.posts[17]) if 17 in solutions.posts else ""
    records.append(_historical_record(
        make_record, stable_id, fetched_at, edition=2, source_id="meta", area="航海日记",
        kind="final_meta", title="航海日记 Meta", question=meta_question, answer="",
        solution=meta_solution, source_tid=questions.tid, raw_paths=questions.raw_paths + solutions.raw_paths,
        content_status="incomplete_official", content_format="text_missing_inputs",
        solution_status="available" if meta_solution else "missing_official",
        recovery_notes=["The Meta used submission-only extraction coordinates that are not preserved in the question thread."],
        extra_metadata={
            "solution_floor": 17,
            "composite_question": True,
            **_solution_provenance(solutions),
        },
    ))
    records[-1]["quality"]["has_question"] = True
    return records


def _load_c3(snapshots: dict[str, ThreadSnapshot], make_record: Callable[..., dict[str, Any]], stable_id: Callable[..., str], fetched_at: str) -> list[dict[str, Any]]:
    questions = snapshots["c3_questions"]
    text = "\n".join(
        render_fragments(questions.posts[floor]) for floor in C3_QUESTION_FLOORS
        if floor in questions.posts
    )
    split = _split_numbered(text, 1, 32)
    expected_surviving = set(range(1, 9)) | set(range(17, 33))
    if set(split) != expected_surviving:
        raise RuntimeError(
            "CCBC 3 surviving question-number mismatch: "
            f"actual={sorted(split)}, expected={sorted(expected_surviving)}"
        )
    records = []
    for number in range(1, 33):
        title, body = split.get(number, (f"32强题 {number}", ""))
        is_media_only = bool(body) and not re.sub(r"!\[[^\]]*\]\([^)]+\)", "", body).strip()
        records.append(_historical_record(
            make_record, stable_id, fetched_at, edition=3, source_id=f"round32-{number:02d}",
            area="32强", kind="puzzle", title=title, question=body,
            answer=C3_ANSWERS[number - 1], solution="", source_tid=questions.tid,
            raw_paths=questions.raw_paths + snapshots["c3_solutions"].raw_paths,
            content_status="available" if body else "missing_official",
            content_format=("media_or_markup" if is_media_only else "text") if body else "missing",
            solution_status="answer_only",
            recovery_notes=["Only the official answer list survives; the original detailed solution posts are deleted."],
            extra_metadata={
                "sequence_number": number,
                "answer_country": C3_GROUP_NAMES[number - 1],
                **_solution_provenance(snapshots["c3_solutions"]),
            },
        ))
    announcements = snapshots["c3_announcements"]
    for number, floor in C3_SECOND_ROUND_FLOORS.items():
        block = render_fragments(announcements.posts[floor]) if floor in announcements.posts else ""
        images = re.findall(r"!\[官方原图\]\(([^)]+)\)", block)
        offset = (number - 1) % 2
        question = f"![官方题图]({images[offset]})" if len(images) > offset else ""
        records.append(_historical_record(
            make_record, stable_id, fetched_at, edition=3, source_id=f"round8-{number}",
            area="8强", kind="puzzle", title=f"8强题 {number}", question=question,
            source_tid=announcements.tid, raw_paths=announcements.raw_paths,
            content_status="available" if question else "missing_official",
            content_format="media_or_markup" if question else "missing", solution_status="missing_official",
            recovery_notes=["The official puzzle image survives; its answer and detailed solution posts are deleted."],
            extra_metadata={"sequence_number": number, "question_floor": floor},
        ))
    meta = snapshots["c3_meta"]
    submission_post = render_fragments(meta.posts[min(meta.posts)]) if meta.posts else ""
    stage_clue = render_fragments(questions.posts[10]) if 10 in questions.posts else ""
    # The stage-transition narrative and burned-parchment clue survive in the
    # question thread. The later unlock text and official solution do not; the
    # separate surviving Meta thread is only a submission endpoint.
    records.append(_historical_record(
        make_record, stable_id, fetched_at, edition=3, source_id="final-meta", area="Final Meta",
        kind="final_meta", title="CCBC 3 Final Meta", question=stage_clue,
        source_tid=questions.tid, raw_paths=questions.raw_paths + meta.raw_paths,
        content_status="incomplete_official" if stage_clue else "missing_official",
        content_format="media_or_markup" if stage_clue else "missing",
        solution_status="missing_official",
        recovery_notes=[
            "The stage-transition narrative and burned-parchment clue survive, but the later complete Meta unlock and official solution are deleted."
        ],
        extra_metadata={
            "stage_clue_floor": 10,
            "surviving_clue_only": True,
            "missing_complete_prompt": True,
            "submission_thread_id": meta.tid,
            "submission_url": THREAD_URL.format(tid=meta.tid),
            "submission_post_survives": bool(submission_post),
        },
    ))
    return records


def _load_c4(snapshots: dict[str, ThreadSnapshot], make_record: Callable[..., dict[str, Any]], stable_id: Callable[..., str], fetched_at: str) -> list[dict[str, Any]]:
    act1 = snapshots["c4_act1"]
    act1_text = "\n".join(render_fragments(act1.posts[floor]) for floor in (7, 10) if floor in act1.posts)
    act1_rooms = _split_rooms(act1_text)
    solution_block = render_fragments(snapshots["c4_solutions"].posts[3]) if 3 in snapshots["c4_solutions"].posts else ""
    solution_sections = re.split(
        r"【\s*第一幕\s*meta\s*】", solution_block, maxsplit=1, flags=re.IGNORECASE,
    )
    room_solution_block = solution_sections[0]
    act1_meta_solution = solution_sections[1].strip() if len(solution_sections) == 2 else ""
    solution_parts = _split_numbered(room_solution_block, 9, 16)
    if solution_block and set(solution_parts) != set(range(9, 17)):
        raise RuntimeError(
            "CCBC 4 first-act solution-number mismatch: "
            f"actual={sorted(solution_parts)}, expected={list(range(9, 17))}"
        )
    if any("第一幕meta" in body.replace(" ", "").lower() for _, body in solution_parts.values()):
        raise RuntimeError("CCBC 4 first-act Meta leaked into a room solution")
    records = []
    for number in range(1, 17):
        question = act1_rooms.get(number, "")
        solution = solution_parts.get(number, ("", ""))[1]
        if solution:
            solution = f"答案：{C4_ACT1_ANSWERS[number]}\n\n{solution}"
        records.append(_historical_record(
            make_record, stable_id, fetched_at, edition=4, source_id=f"act1-room-{number:02d}",
            area="第一幕", kind="puzzle", title=f"第一幕・房间 {number}", question=question,
            answer=C4_ACT1_ANSWERS.get(number, ""), solution=solution, source_tid=act1.tid,
            raw_paths=act1.raw_paths + snapshots["c4_solutions"].raw_paths,
            content_status="available" if question else "missing_official",
            content_format="text" if question else "missing",
            solution_status=(
                "available" if solution and question
                else "available_without_question" if solution
                else "answer_only" if number in C4_ACT1_ANSWERS
                else "missing_official"
            ),
            recovery_notes=[] if question else ["The official question floor is deleted."],
            extra_metadata={
                "room_number": number,
                **_solution_provenance(snapshots["c4_solutions"]),
            },
        ))
    records.append(_historical_record(
        make_record, stable_id, fetched_at, edition=4, source_id="act1-meta", area="第一幕",
        kind="meta", title="第一幕 Meta", question="", answer="TOPSPIRE",
        solution=act1_meta_solution,
        source_tid=snapshots["c4_solutions"].tid,
        raw_paths=snapshots["c4_solutions"].raw_paths, content_status="missing_official",
        content_format="missing",
        solution_status="available_without_question" if act1_meta_solution else "missing_official",
        recovery_notes=["The official Meta question/unlock text is deleted; its solution survives."],
        extra_metadata=_solution_provenance(snapshots["c4_solutions"]),
    ))
    for key, area, source_prefix in (
        ("c4_act2_upper", "第二幕（上）", "act2-upper"),
        ("c4_act2_lower", "第二幕（下）", "act2-lower"),
    ):
        snapshot = snapshots[key]
        rooms: dict[int, str] = {}
        for floor, post in snapshot.posts.items():
            post_text = render_fragments(post)
            post_rooms = _split_rooms(post_text)
            for number, question in post_rooms.items():
                if number in rooms:
                    raise RuntimeError(
                        f"Duplicate CCBC 4 room marker: thread={snapshot.tid}, room={number}"
                    )
                rooms[number] = question
        for number in range(1, 8):
            question = rooms.get(number, "")
            records.append(_historical_record(
                make_record, stable_id, fetched_at, edition=4,
                source_id=f"{source_prefix}-room-{number}", area=area, kind="puzzle",
                title=f"{area}・房间 {number}", question=question, source_tid=snapshot.tid,
                raw_paths=snapshot.raw_paths + snapshots["c4_solutions"].raw_paths,
                content_status="available" if question else "missing_official",
                content_format="media_or_markup" if question else "missing", solution_status="missing_official",
                recovery_notes=["The corresponding official answer/solution floor is deleted."],
                extra_metadata={"room_number": number},
            ))
    records.append(_historical_record(
        make_record, stable_id, fetched_at, edition=4, source_id="act2-meta", area="第二幕（下）",
        kind="final_meta", title="第二幕 Meta / Final Meta", question="", source_tid=snapshots["c4_solutions"].tid,
        raw_paths=snapshots["c4_solutions"].raw_paths, content_status="missing_official",
        content_format="missing", solution_status="missing_official",
        recovery_notes=["Both the official Meta question floor and solution floor are deleted."],
        extra_metadata=_solution_provenance(snapshots["c4_solutions"]),
    ))
    return records


def load_historical_tieba_records(
    *, raw_root: Path, refresh: bool, atomic_write: Callable[[Path, bytes], None],
    make_record: Callable[..., dict[str, Any]], stable_id: Callable[..., str], fetched_at: str,
) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    snapshots = {
        key: fetch_thread(raw_root, key, tid, refresh, atomic_write, only_author=False)
        for key, tid in THREADS.items()
    }
    records = (
        _load_c2(snapshots, make_record, stable_id, fetched_at)
        + _load_c3(snapshots, make_record, stable_id, fetched_at)
        + _load_c4(snapshots, make_record, stable_id, fetched_at)
    )
    expected = {"ccbc2": 14, "ccbc3": 41, "ccbc4": 32}
    actual = {event: sum(record["event_id"] == event for record in records) for event in expected}
    if actual != expected:
        raise RuntimeError(f"Historical recovery count mismatch: actual={actual}, expected={expected}")
    by_event = {
        event: [record for record in records if record["event_id"] == event]
        for event in expected
    }
    expected_solution_statuses = {
        "ccbc2": {"available": 10, "available_without_question": 1, "missing_official": 3},
        "ccbc3": {"answer_only": 32, "missing_official": 9},
        "ccbc4": {"available_without_question": 9, "missing_official": 23},
    }
    for event, statuses in expected_solution_statuses.items():
        actual_statuses = {
            status: sum(record["solution_status"] == status for record in by_event[event])
            for status in statuses
        }
        if actual_statuses != statuses:
            raise RuntimeError(
                f"Historical solution status mismatch for {event}: "
                f"actual={actual_statuses}, expected={statuses}"
            )
    eligible_history = {
        record["record_id"] for record in records if record["quality"].get("pair_eligible")
    }
    expected_eligible_history = {
        stable_id("ccbc2", source_id) for source_id in ("puzzle-01", "puzzle-04", "puzzle-07")
    }
    if eligible_history != expected_eligible_history:
        raise RuntimeError(
            "Historical pair eligibility mismatch: "
            f"actual={sorted(eligible_history)}, expected={sorted(expected_eligible_history)}"
        )
    metadata = {
        "source_type": "official Tieba posts recovered through the public app protobuf endpoint",
        "snapshot_mode": "all visible posts, paginated until has_more=false",
        "normalized_selection": "posts by verified CCBC organizer author IDs",
        "protocol_definition_source": PROTOCOL_SOURCE,
        "threads": {
            key: {
                "thread_id": snapshot.tid,
                "title": snapshot.title,
                "source_url": THREAD_URL.format(tid=snapshot.tid),
                "raw_page_paths": snapshot.raw_paths,
                "visible_official_post_count": len(snapshot.posts),
                "visible_all_post_count": snapshot.visible_post_count,
            }
            for key, snapshot in snapshots.items()
        },
        "counts": actual,
        "completeness": "partial_due_to_deleted_posts_and_media",
        "original_event_content_complete": False,
    }
    return records, metadata
