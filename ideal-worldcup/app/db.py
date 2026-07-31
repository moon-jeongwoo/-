"""
SQLite 연결을 관리하는 곳.

SQLite는 MySQL/MongoDB와 다르게 별도로 설치해서 실행해두는 "서버 프로그램"이 없습니다.
파이썬 표준 라이브러리 sqlite3가 그냥 로컬 파일(data/app.db) 하나를 열고 닫으면서
데이터를 읽고 쓰는 것뿐이라, 이 프로젝트를 실행하는 데 DB 관련 설치가 전혀 필요 없습니다.
"""

import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent.parent / "data" / "app.db"
SCHEMA_PATH = Path(__file__).resolve().parent / "schema.sql"


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    # row_factory를 Row로 설정하면 조회 결과를 컬럼 이름으로 꺼낼 수 있음 (row["title"] 처럼).
    conn.row_factory = sqlite3.Row
    # 외래 키(REFERENCES) 제약을 실제로 검사하게 켜줌 -- sqlite3는 기본값이 꺼짐.
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db() -> None:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    schema_sql = SCHEMA_PATH.read_text(encoding="utf-8")
    conn = get_connection()
    try:
        conn.executescript(schema_sql)
        conn.commit()
    finally:
        conn.close()
