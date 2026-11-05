# Retrieval metrics

The bundled evaluation measures retrieval only. It uses distinct source document IDs in ranked order when comparing results with `expected_source_ids`.

- **Hit Rate**: fraction of cases with at least one expected source in the retrieved top k.
- **Reciprocal Rank**: `1 / rank` of the first expected source, or zero when no expected source is retrieved. MRR is its mean across cases.
- **Precision@k**: number of retrieved expected source IDs divided by configured k.
- **Recall@k**: number of retrieved expected source IDs divided by the number of expected source IDs for that case. A case with no expected sources has recall zero.
- **BM25-style score**: sums an inverse document frequency weighted term-frequency score, normalized by chunk length. This is lexical matching; paraphrases without shared terms may rank poorly.

Scores are deterministic for a fixed corpus and query. The current test suite checks ranking invariants and known fixture outcomes. It does not claim an LLM judge agreement score or semantic retrieval quality.
