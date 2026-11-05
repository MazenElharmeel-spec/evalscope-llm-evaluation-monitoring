from __future__ import annotations

import json
import os
import sqlite3
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException

from . import storage
from .retrieval import Passage, retrieve
from .schemas import (
    ChatOut,
    DocumentIn,
    DocumentOut,
    EvalCase,
    EvalCaseResult,
    EvalOut,
    EvalRequest,
    EvidenceOut,
    SearchOut,
    SearchRequest,
)


@asynccontextmanager
async def lifespan(_: FastAPI):
    storage.initialize()
    yield


app = FastAPI(
    title="EvalScope RAG Demo API",
    version="0.1.0",
    description="A local, no-key document retrieval and citation demo used by the EvalScope project.",
    lifespan=lifespan,
)


def evidence(passage: Passage, score: float) -> EvidenceOut:
    return EvidenceOut(
        chunk_id=passage.chunk_id,
        document_id=passage.document_id,
        title=passage.title,
        text=passage.text,
        score=round(score, 6),
    )


def run_cases(cases: list[EvalCase], top_k: int) -> EvalOut:
    passages = storage.all_passages()
    results: list[EvalCaseResult] = []
    for case in cases:
        found = retrieve(case.question, passages, top_k=top_k)
        ids = list(dict.fromkeys(passage.document_id for passage, _ in found))
        relevant = set(case.expected_source_ids)
        hits = [source_id for source_id in ids if source_id in relevant]
        first_rank = next((rank for rank, source_id in enumerate(ids, 1) if source_id in relevant), None)
        results.append(
            EvalCaseResult(
                id=case.id,
                retrieved_source_ids=ids,
                hit=bool(hits),
                reciprocal_rank=(1 / first_rank if first_rank else 0),
                precision_at_k=(len(hits) / top_k),
                recall_at_k=(len(set(hits)) / len(relevant) if relevant else 0),
            )
        )

    count = len(results)
    mean = lambda values: round(sum(values) / count, 4) if count else 0.0
    return EvalOut(
        case_count=count,
        hit_rate=mean([float(result.hit) for result in results]),
        mean_reciprocal_rank=mean([result.reciprocal_rank for result in results]),
        mean_precision_at_k=mean([result.precision_at_k for result in results]),
        mean_recall_at_k=mean([result.recall_at_k for result in results]),
        results=results,
    )


@app.get("/healthz", tags=["system"])
def health() -> dict[str, str]:
    return {"status": "ok", "mode": "local-demo"}


@app.get("/api/v1/documents", response_model=list[DocumentOut], tags=["documents"])
def documents() -> list[dict[str, str | int]]:
    return storage.list_documents()


@app.post("/api/v1/documents", response_model=DocumentOut, status_code=201, tags=["documents"])
def create_document(document: DocumentIn) -> dict[str, str | int]:
    try:
        chunk_count = storage.add_document(document.id, document.title, document.content)
    except sqlite3.IntegrityError as exc:
        raise HTTPException(status_code=409, detail="A document with this id already exists") from exc
    return {"id": document.id, "title": document.title, "chunk_count": chunk_count}


@app.post("/api/v1/search", response_model=SearchOut, tags=["retrieval"])
def search(request: SearchRequest) -> SearchOut:
    found = retrieve(request.query, storage.all_passages(), top_k=request.top_k)
    return SearchOut(query=request.query, results=[evidence(passage, score) for passage, score in found])


@app.post("/api/v1/chat", response_model=ChatOut, tags=["assistant"])
def chat(request: SearchRequest) -> ChatOut:
    found = retrieve(request.query, storage.all_passages(), top_k=request.top_k)
    if not found:
        return ChatOut(
            question=request.query,
            answer="I couldn't find a supporting passage in the indexed documents, so I don't know.",
            citations=[],
            abstained=True,
        )
    best, score = found[0]
    return ChatOut(
        question=request.query,
        answer=f"{best.text} [Source: {best.document_id}]",
        citations=[evidence(passage, item_score) for passage, item_score in found],
        abstained=False,
    )


@app.post("/api/v1/evaluate", response_model=EvalOut, tags=["evaluation"])
def evaluate(request: EvalRequest) -> EvalOut:
    cases = request.cases
    if cases is None:
        golden_path = Path(os.getenv("GOLDEN_DATASET_PATH", "data/golden_cases.json"))
        cases = [EvalCase.model_validate(case) for case in json.loads(golden_path.read_text(encoding="utf-8"))]
    if not cases:
        raise HTTPException(status_code=422, detail="Provide at least one evaluation case")
    return run_cases(cases, request.top_k)
