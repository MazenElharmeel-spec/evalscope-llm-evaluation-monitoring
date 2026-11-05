# API reference

The running service generates a full OpenAPI schema. Use <http://localhost:8000/docs> for interactive Swagger UI and <http://localhost:8000/openapi.json> for the JSON contract.

## Health

`GET /healthz` returns `{"status":"ok","mode":"local-demo"}`.

## List documents

`GET /api/v1/documents` returns document IDs, titles, and chunk counts.

## Add a document

`POST /api/v1/documents` accepts JSON:

```json
{
  "id": "account-guide",
  "title": "Account Guide",
  "content": "Use multifactor authentication for privileged accounts."
}
```

IDs must contain letters, digits, underscores, or hyphens. Content is limited to 100,000 characters. A duplicate ID returns `409`; schema errors return `422`.

## Search

`POST /api/v1/search` accepts `{"query":"What does recall at k measure?","top_k":3}`. `top_k` is bounded to 1–10. The response includes passages with chunk ID, document ID, title, snippet text, and BM25 score.

## Chat

`POST /api/v1/chat` accepts the same request shape. The response contains the question, an extractive answer with an inline source ID, supporting citations, and an `abstained` boolean. No LLM is called.

## Evaluate retrieval

`POST /api/v1/evaluate` accepts no body to load `data/golden_cases.json`, or a request such as:

```json
{
  "top_k": 3,
  "cases": [
    {"id":"recall","question":"What does recall at k measure?","expected_source_ids":["rag-evaluation"]}
  ]
}
```

The response includes per-case retrieved source IDs, hit, reciprocal rank, Precision@k, and Recall@k, plus macro averages.
