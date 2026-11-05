from pydantic import BaseModel, Field


class DocumentIn(BaseModel):
    id: str = Field(min_length=1, max_length=80, pattern=r"^[a-zA-Z0-9_-]+$")
    title: str = Field(min_length=1, max_length=200)
    content: str = Field(min_length=1, max_length=100_000)


class DocumentOut(BaseModel):
    id: str
    title: str
    chunk_count: int


class SearchRequest(BaseModel):
    query: str = Field(min_length=2, max_length=2_000)
    top_k: int = Field(default=3, ge=1, le=10)


class EvidenceOut(BaseModel):
    chunk_id: str
    document_id: str
    title: str
    text: str
    score: float


class SearchOut(BaseModel):
    query: str
    results: list[EvidenceOut]


class ChatOut(BaseModel):
    question: str
    answer: str
    citations: list[EvidenceOut]
    abstained: bool


class EvalCase(BaseModel):
    id: str
    question: str
    expected_source_ids: list[str]


class EvalRequest(BaseModel):
    cases: list[EvalCase] | None = None
    top_k: int = Field(default=3, ge=1, le=10)


class EvalCaseResult(BaseModel):
    id: str
    retrieved_source_ids: list[str]
    hit: bool
    reciprocal_rank: float
    precision_at_k: float
    recall_at_k: float


class EvalOut(BaseModel):
    case_count: int
    hit_rate: float
    mean_reciprocal_rank: float
    mean_precision_at_k: float
    mean_recall_at_k: float
    results: list[EvalCaseResult]
