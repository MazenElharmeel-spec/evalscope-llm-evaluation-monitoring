# Limitations and security notes

- BM25 lexical scoring is not embedding-based semantic retrieval.
- Answers are copied from a retrieved chunk with a source label. There is no language model generation or model-provider integration.
- The sample API has no authentication or authorization. Do not expose it outside a trusted local environment.
- SQLite and the in-memory ranking path are intended for a small single-user demo, not concurrent production traffic.
- Uploaded content is persisted as plain text. There is no encryption-at-rest, deletion API, retention schedule, or PII redaction.
- Evaluation only compares retrieved source IDs. It does not measure correctness, faithfulness, safety, latency, tokens, or cost.
- Dashboard charts are seeded visual examples, not outputs from the API evaluation.

Use public or fictional text only. Add access controls, tenant isolation, safe file processing, retention, monitoring, and production-grade storage before handling real customer content.
