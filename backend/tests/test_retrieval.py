from app.retrieval import Passage, bm25_scores, retrieve, split_chunks, tokenize


def test_tokenize_normalizes_case_and_punctuation() -> None:
    assert tokenize("RAG, Recall@k and grounded answers!") == [
        "rag",
        "recall",
        "k",
        "grounded",
        "answers",
    ]


def test_split_chunks_keeps_sentences_and_respects_limit() -> None:
    chunks = split_chunks("First sentence. Second sentence is longer! Third one?", max_chars=30)
    assert chunks == ["First sentence.", "Second sentence is longer!", "Third one?"]
    assert all(len(chunk) <= 30 for chunk in chunks)


def test_bm25_ranks_matching_passage_above_unrelated_passage() -> None:
    scores = bm25_scores(
        "retrieval recall", ["recall measures relevant retrieval", "the weather is sunny"]
    )
    assert scores[0] > scores[1] == 0


def test_retrieve_returns_only_positive_matches_and_is_stable_on_ties() -> None:
    passages = [
        Passage("b-1", "b", "B", "recall measures relevant sources"),
        Passage("a-1", "a", "A", "recall measures relevant sources"),
        Passage("c-1", "c", "C", "a document about gardens"),
    ]
    ranked = retrieve("recall relevant sources", passages, top_k=3)
    assert [passage.document_id for passage, _ in ranked] == ["a", "b"]


def test_empty_query_and_corpus_return_no_matches() -> None:
    assert bm25_scores("", ["some text"]) == [0.0]
    assert retrieve("anything", [], top_k=2) == []
