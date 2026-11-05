"""Small SQLite persistence layer for a self-contained local demo."""

from __future__ import annotations

import json
import os
import sqlite3
from pathlib import Path
from .retrieval import Passage, split_chunks

DEFAULT_DB_PATH = Path(os.getenv("DATABASE_PATH", "data/evalscope.sqlite3"))
CORPUS_PATH = Path(os.getenv("CORPUS_PATH", "data/demo_corpus.json"))


def connect(db_path: Path | None = None) -> sqlite3.Connection:
    db_path = db_path or DEFAULT_DB_PATH
    db_path.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(db_path)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    return connection


def initialize(db_path: Path | None = None, corpus_path: Path | None = None) -> None:
    db_path = db_path or DEFAULT_DB_PATH
    corpus_path = corpus_path or CORPUS_PATH
    with connect(db_path) as db:
        db.executescript(
            """
            CREATE TABLE IF NOT EXISTS documents (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS chunks (
                id TEXT PRIMARY KEY,
                document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
                position INTEGER NOT NULL,
                text TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS ix_chunks_document_id ON chunks(document_id);
            """
        )
        existing = db.execute("SELECT COUNT(*) AS count FROM documents").fetchone()["count"]
        if existing == 0:
            for document in json.loads(corpus_path.read_text(encoding="utf-8")):
                insert_document(db, document["id"], document["title"], document["content"])


def insert_document(db: sqlite3.Connection, document_id: str, title: str, content: str) -> int:
    chunks = split_chunks(content)
    db.execute("INSERT INTO documents(id, title, content) VALUES(?, ?, ?)", (document_id, title, content))
    db.executemany(
        "INSERT INTO chunks(id, document_id, position, text) VALUES(?, ?, ?, ?)",
        [(f"{document_id}-{index + 1}", document_id, index, chunk) for index, chunk in enumerate(chunks)],
    )
    return len(chunks)


def list_documents(db_path: Path | None = None) -> list[dict[str, str | int]]:
    with connect(db_path) as db:
        rows = db.execute(
            "SELECT d.id, d.title, COUNT(c.id) AS chunk_count FROM documents d "
            "LEFT JOIN chunks c ON c.document_id = d.id GROUP BY d.id ORDER BY d.title"
        ).fetchall()
    return [dict(row) for row in rows]


def all_passages(db_path: Path | None = None) -> list[Passage]:
    with connect(db_path) as db:
        rows = db.execute(
            "SELECT c.id AS chunk_id, d.id AS document_id, d.title, c.text "
            "FROM chunks c JOIN documents d ON d.id = c.document_id ORDER BY c.document_id, c.position"
        ).fetchall()
    return [Passage(row["chunk_id"], row["document_id"], row["title"], row["text"]) for row in rows]


def add_document(document_id: str, title: str, content: str, db_path: Path | None = None) -> int:
    with connect(db_path) as db:
        return insert_document(db, document_id, title, content)
