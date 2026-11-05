def test_health_and_seeded_documents(client) -> None:
    assert client.get("/healthz").json() == {"status": "ok", "mode": "local-demo"}
    documents = client.get("/api/v1/documents").json()
    assert {document["id"] for document in documents} == {
        "rag-security", "rag-evaluation", "api-operations", "privacy-guidance"
    }


def test_search_and_chat_return_source_citations(client) -> None:
    results = client.post("/api/v1/search", json={"query": "What is recall at k?", "top_k": 3})
    assert results.status_code == 200
    assert results.json()["results"][0]["document_id"] == "rag-evaluation"

    response = client.post("/api/v1/chat", json={"query": "What is recall at k?"})
    body = response.json()
    assert response.status_code == 200
    assert "fraction of relevant source documents" in body["answer"]
    assert body["citations"][0]["document_id"] == "rag-evaluation"
    assert body["abstained"] is False


def test_chat_abstains_when_no_passage_matches(client) -> None:
    response = client.post("/api/v1/chat", json={"query": "What is the capital of Atlantis?"})
    assert response.status_code == 200
    assert response.json()["abstained"] is True
    assert response.json()["citations"] == []


def test_document_ingestion_is_persisted_and_duplicate_id_is_rejected(client) -> None:
    document = {"id": "new-guide", "title": "New Guide", "content": "The demo stores documents in SQLite."}
    created = client.post("/api/v1/documents", json=document)
    assert created.status_code == 201
    assert created.json()["chunk_count"] == 1
    assert client.post("/api/v1/documents", json=document).status_code == 409
    assert "new-guide" in {item["id"] for item in client.get("/api/v1/documents").json()}


def test_evaluation_uses_reference_source_ids(client) -> None:
    response = client.post(
        "/api/v1/evaluate",
        json={"cases": [{"id": "recall", "question": "What is recall at k?", "expected_source_ids": ["rag-evaluation"]}]},
    )
    assert response.status_code == 200
    result = response.json()
    assert result["case_count"] == 1
    assert result["hit_rate"] == 1.0
    assert result["mean_reciprocal_rank"] == 1.0


def test_validation_errors_are_readable(client) -> None:
    response = client.post("/api/v1/search", json={"query": "x", "top_k": 3})
    assert response.status_code == 422
    assert response.json()["detail"]
