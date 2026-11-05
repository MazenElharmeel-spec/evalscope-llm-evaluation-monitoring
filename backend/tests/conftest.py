from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app import storage
from app.main import app


@pytest.fixture
def client(tmp_path: Path, monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setattr(storage, "DEFAULT_DB_PATH", tmp_path / "evalscope-test.sqlite3")
    monkeypatch.setattr(storage, "CORPUS_PATH", Path("data/demo_corpus.json"))
    with TestClient(app) as test_client:
        yield test_client
