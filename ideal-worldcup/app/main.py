"""
이상형 월드컵 백엔드 -- FastAPI + SQLite.

라우트가 몇 개 안 돼서(7개) 라우터 파일을 따로 안 쪼개고 이 파일 하나에 다 둡니다.
흐름: 대회 생성 -> next-match로 다음 대결 받아오기 -> vote로 승자 기록 -> 반복 -> 결과 조회.
"""

import random
import sqlite3
from datetime import datetime, timezone
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from . import bracket
from .db import get_connection, init_db
from .presets import CATEGORIES

app = FastAPI()


@app.on_event("startup")
def on_startup() -> None:
    init_db()


# ---- 요청 바디 모양 정의 (pydantic이 알아서 타입 검증/에러 응답까지 해줌) ----


class CandidateIn(BaseModel):
    name: str
    image_url: str | None = None


class TournamentCreate(BaseModel):
    title: str
    candidates: list[CandidateIn]


class VoteIn(BaseModel):
    match_id: int
    winner_id: int


class QuickStartIn(BaseModel):
    category: str
    size: int


# ---- 대회 생성 공통 로직 (직접 만들기 / 바로 시작하기 둘 다 여기로 모임) ----


def _create_tournament(conn: sqlite3.Connection, title: str, candidates: list[tuple[str, str | None]]) -> int:
    cur = conn.execute(
        "INSERT INTO tournaments (title, created_at) VALUES (?, ?)",
        (title, datetime.now(timezone.utc).isoformat()),
    )
    tournament_id = cur.lastrowid

    candidate_ids = []
    for name, image_url in candidates:
        cur = conn.execute(
            "INSERT INTO candidates (tournament_id, name, image_url) VALUES (?, ?, ?)",
            (tournament_id, name, image_url),
        )
        candidate_ids.append(cur.lastrowid)

        # 이번에 입력한 이름+이미지를 라이브러리에 기억해둠 -- 다음에 같은 이름을 쓰면 자동으로
        # 이미지가 채워짐. 이미지를 안 넣은 경우엔 기존에 저장돼 있던 이미지를 지우지 않음.
        conn.execute(
            "INSERT INTO candidate_library (name, image_url) VALUES (?, ?) "
            "ON CONFLICT(name) DO UPDATE SET "
            "image_url = COALESCE(excluded.image_url, candidate_library.image_url)",
            (name, image_url),
        )

    pairs = bracket.make_first_round_pairs(candidate_ids)
    first_round = len(candidate_ids)
    for order, (a, b) in enumerate(pairs):
        conn.execute(
            "INSERT INTO matches (tournament_id, round, match_order, candidate_a_id, candidate_b_id) "
            "VALUES (?, ?, ?, ?, ?)",
            (tournament_id, first_round, order, a, b),
        )

    return tournament_id


# ---- API 라우트 ----


@app.post("/api/tournaments")
def create_tournament(body: TournamentCreate):
    if len(body.candidates) not in bracket.VALID_SIZES:
        raise HTTPException(
            400, f"후보는 {bracket.VALID_SIZES} 중 하나의 개수여야 해요 (대진표를 짜려면 2의 거듭제곱).")

    conn = get_connection()
    try:
        candidates = [(c.name, c.image_url) for c in body.candidates]
        tournament_id = _create_tournament(conn, body.title, candidates)
        conn.commit()
        return {"id": tournament_id}
    finally:
        conn.close()


@app.get("/api/categories")
def list_categories():
    return [
        {"key": key, "title": cat["title"], "pool_size": len(cat["pool"])}
        for key, cat in CATEGORIES.items()
    ]


@app.post("/api/tournaments/quick-start")
def quick_start(body: QuickStartIn):
    category = CATEGORIES.get(body.category)
    if category is None:
        raise HTTPException(404, "그런 카테고리가 없어요.")
    if body.size not in bracket.VALID_SIZES:
        raise HTTPException(
            400, f"대결 규모는 {bracket.VALID_SIZES} 중 하나여야 해요.")
    if body.size > len(category["pool"]):
        raise HTTPException(400, f"이 카테고리는 후보가 {len(category['pool'])}명뿐이에요.")

    chosen = random.sample(category["pool"], body.size)
    candidates = [(c["name"], c["image_url"]) for c in chosen]

    conn = get_connection()
    try:
        tournament_id = _create_tournament(conn, category["title"], candidates)
        conn.commit()
        return {"id": tournament_id}
    finally:
        conn.close()


@app.get("/api/candidate-library")
def list_candidate_library():
    conn = get_connection()
    try:
        rows = conn.execute("SELECT name, image_url FROM candidate_library ORDER BY name").fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()


@app.get("/api/tournaments")
def list_tournaments():
    conn = get_connection()
    try:
        rows = conn.execute(
            "SELECT t.id, t.title, t.created_at, c.name AS champion_name "
            "FROM tournaments t LEFT JOIN candidates c ON c.id = t.champion_id "
            "ORDER BY t.id DESC"
        ).fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()


@app.get("/api/tournaments/{tournament_id}")
def get_tournament(tournament_id: int):
    conn = get_connection()
    try:
        t = conn.execute("SELECT * FROM tournaments WHERE id = ?", (tournament_id,)).fetchone()
        if t is None:
            raise HTTPException(404, "그런 대회가 없어요.")
        candidates = conn.execute(
            "SELECT * FROM candidates WHERE tournament_id = ?", (tournament_id,)
        ).fetchall()
        return {"tournament": dict(t), "candidates": [dict(c) for c in candidates]}
    finally:
        conn.close()


@app.delete("/api/tournaments/{tournament_id}")
def delete_tournament(tournament_id: int):
    conn = get_connection()
    try:
        # champion_id가 candidates를 가리키고 candidates.tournament_id가 다시 tournaments를 가리키는
        # 상호 참조라, candidates를 지우기 전에 champion_id부터 비워둬야 외래 키 제약에 안 걸림.
        conn.execute("UPDATE tournaments SET champion_id = NULL WHERE id = ?", (tournament_id,))
        conn.execute("DELETE FROM matches WHERE tournament_id = ?", (tournament_id,))
        conn.execute("DELETE FROM candidates WHERE tournament_id = ?", (tournament_id,))
        conn.execute("DELETE FROM tournaments WHERE id = ?", (tournament_id,))
        conn.commit()
        return {"ok": True}
    finally:
        conn.close()


@app.get("/api/tournaments/{tournament_id}/next-match")
def next_match(tournament_id: int):
    conn = get_connection()
    try:
        row = conn.execute(
            "SELECT m.id AS match_id, m.round AS round, m.match_order AS match_order, "
            "       t.title AS tournament_title, "
            "       a.id AS a_id, a.name AS a_name, a.image_url AS a_image_url, "
            "       b.id AS b_id, b.name AS b_name, b.image_url AS b_image_url "
            "FROM matches m "
            "JOIN tournaments t ON t.id = m.tournament_id "
            "JOIN candidates a ON a.id = m.candidate_a_id "
            "JOIN candidates b ON b.id = m.candidate_b_id "
            "WHERE m.tournament_id = ? AND m.winner_id IS NULL "
            "ORDER BY m.match_order LIMIT 1",
            (tournament_id,),
        ).fetchone()
        if row is None:
            return None
        result = dict(row)
        # round는 "이 라운드에 들어온 후보 수"라, 매치 개수는 그 절반 -- 프론트에서 "8강 1/4" 같은 진행 표시에 씀.
        result["round_label"] = bracket.round_label(result["round"])
        result["match_position"] = result["match_order"] + 1
        result["matches_in_round"] = result["round"] // 2
        return result
    finally:
        conn.close()


@app.post("/api/tournaments/{tournament_id}/vote")
def vote(tournament_id: int, body: VoteIn):
    conn = get_connection()
    try:
        match = conn.execute(
            "SELECT * FROM matches WHERE id = ? AND tournament_id = ?",
            (body.match_id, tournament_id),
        ).fetchone()
        if match is None:
            raise HTTPException(404, "그런 매치가 없어요.")
        if body.winner_id not in (match["candidate_a_id"], match["candidate_b_id"]):
            raise HTTPException(400, "이 매치에 나온 후보가 아니에요.")

        conn.execute("UPDATE matches SET winner_id = ? WHERE id = ?", (body.winner_id, body.match_id))
        conn.execute("UPDATE candidates SET wins = wins + 1 WHERE id = ?", (body.winner_id,))

        current_round = match["round"]
        remaining = conn.execute(
            "SELECT COUNT(*) AS n FROM matches WHERE tournament_id = ? AND round = ? AND winner_id IS NULL",
            (tournament_id, current_round),
        ).fetchone()["n"]

        if remaining == 0:
            # 방금 끝난 라운드의 승자들을, 그 라운드 안에서의 순서 그대로 가져옴.
            winners = [
                r["winner_id"]
                for r in conn.execute(
                    "SELECT winner_id FROM matches WHERE tournament_id = ? AND round = ? "
                    "ORDER BY match_order",
                    (tournament_id, current_round),
                ).fetchall()
            ]

            if len(winners) == 1:
                conn.execute(
                    "UPDATE tournaments SET champion_id = ? WHERE id = ?",
                    (winners[0], tournament_id),
                )
            else:
                pairs = bracket.make_next_round_pairs(winners)
                next_round = len(winners)
                for order, (a, b) in enumerate(pairs):
                    conn.execute(
                        "INSERT INTO matches (tournament_id, round, match_order, candidate_a_id, candidate_b_id) "
                        "VALUES (?, ?, ?, ?, ?)",
                        (tournament_id, next_round, order, a, b),
                    )

        conn.commit()
        return {"ok": True}
    finally:
        conn.close()


@app.get("/api/tournaments/{tournament_id}/results")
def results(tournament_id: int):
    conn = get_connection()
    try:
        t = conn.execute(
            "SELECT t.*, c.name AS champion_name, c.image_url AS champion_image_url "
            "FROM tournaments t LEFT JOIN candidates c ON c.id = t.champion_id "
            "WHERE t.id = ?",
            (tournament_id,),
        ).fetchone()
        if t is None:
            raise HTTPException(404, "그런 대회가 없어요.")
        candidates = conn.execute(
            "SELECT * FROM candidates WHERE tournament_id = ? ORDER BY wins DESC",
            (tournament_id,),
        ).fetchall()
        return {"tournament": dict(t), "candidates": [dict(c) for c in candidates]}
    finally:
        conn.close()


# ---- 정적 파일(HTML/CSS/JS) 서빙 ----
# "/api/..."가 아닌 요청은 static/ 폴더에서 그대로 파일을 찾아 돌려줌 (별도 프론트 서버 없음).

STATIC_DIR = Path(__file__).resolve().parent.parent / "static"


@app.get("/")
def serve_index():
    return FileResponse(STATIC_DIR / "index.html")


app.mount("/", StaticFiles(directory=STATIC_DIR), name="static")
