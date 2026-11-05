"""Pure BM25-style retrieval functions used by the API and unit tests."""

from __future__ import annotations

import math
import re
from collections import Counter
from dataclasses import dataclass

TOKEN_RE = re.compile(r"[a-z0-9]+(?:['’-][a-z0-9]+)?", re.IGNORECASE)
STOPWORDS = {"a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "how", "i", "in", "is", "it", "of", "on", "or", "should", "the", "to", "what", "when", "where", "which", "who", "why", "with"}


def tokenize(text: str) -> list[str]:
    return [token.casefold() for token in TOKEN_RE.findall(text) if token.casefold() not in STOPWORDS]


def split_chunks(text: str, max_chars: int = 520) -> list[str]:
    """Split plain text on sentence boundaries, packing sentences up to max_chars."""
    sentences = [part.strip() for part in re.split(r"(?<=[.!?])\s+|\n+", text.strip()) if part.strip()]
    chunks: list[str] = []
    current = ""
    for sentence in sentences:
        if len(sentence) > max_chars:
            if current:
                chunks.append(current)
                current = ""
            chunks.extend(sentence[index : index + max_chars] for index in range(0, len(sentence), max_chars))
            continue
        candidate = f"{current} {sentence}".strip()
        if len(candidate) > max_chars and current:
            chunks.append(current)
            current = sentence
        else:
            current = candidate
    if current:
        chunks.append(current)
    return chunks


@dataclass(frozen=True)
class Passage:
    chunk_id: str
    document_id: str
    title: str
    text: str


def bm25_scores(query: str, documents: list[str], *, k1: float = 1.5, b: float = 0.75) -> list[float]:
    """Return BM25 scores in input order; empty queries and corpora score zero."""
    query_terms = tokenize(query)
    tokenized = [tokenize(document) for document in documents]
    if not query_terms or not tokenized:
        return [0.0 for _ in documents]

    lengths = [len(tokens) for tokens in tokenized]
    average_length = sum(lengths) / len(lengths) if lengths else 0.0
    document_frequency: Counter[str] = Counter()
    term_frequencies = [Counter(tokens) for tokens in tokenized]
    for frequencies in term_frequencies:
        document_frequency.update(frequencies.keys())

    scores: list[float] = []
    for frequencies, document_length in zip(term_frequencies, lengths, strict=True):
        score = 0.0
        for term in query_terms:
            frequency = frequencies.get(term, 0)
            if frequency == 0:
                continue
            df = document_frequency[term]
            inverse_frequency = math.log(1 + (len(documents) - df + 0.5) / (df + 0.5))
            normalization = frequency + k1 * (1 - b + b * document_length / (average_length or 1))
            score += inverse_frequency * (frequency * (k1 + 1)) / normalization
        scores.append(score)
    return scores


def retrieve(query: str, passages: list[Passage], *, top_k: int = 3) -> list[tuple[Passage, float]]:
    if top_k < 1:
        raise ValueError("top_k must be at least 1")
    scores = bm25_scores(query, [passage.text for passage in passages])
    ranked = sorted(zip(passages, scores, strict=True), key=lambda item: (-item[1], item[0].chunk_id))
    return [(passage, score) for passage, score in ranked if score > 0][:top_k]
