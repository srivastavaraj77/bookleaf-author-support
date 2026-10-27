from typing import Optional, Literal
from pydantic import BaseModel, Field

# The 6 exact categories mandated by the BookLeaf specification
CategoryType = Literal[
    "Royalty & Payments",
    "ISBN & Metadata Issues",
    "Printing & Quality",
    "Distribution & Availability",
    "Book Status & Production Updates",
    "General Inquiry"
]

# The 4 exact priorities mandated by the BookLeaf specification
PriorityType = Literal["Critical", "High", "Medium", "Low"]


class ClassificationResult(BaseModel):
    category: CategoryType = Field(
        ...,
        description="The exact category that best classifies the author's query"
    )
    priority: PriorityType = Field(
        ...,
        description="Priority level based on urgency, financial impact, or operational severity"
    )
    confidence: float = Field(
        default=0.85,
        ge=0.0,
        le=1.0,
        description="Confidence score for this classification"
    )
    reasoning: str = Field(
        ...,
        description="Concise rationale explaining the category and priority assignment"
    )


class DraftGenerationResult(BaseModel):
    draft_response: str = Field(
        ...,
        description="The empathetic, accurate, BookLeaf policy-grounded draft response to the author"
    )
    policy_citations: list[str] = Field(
        default_factory=list,
        description="Key BookLeaf policy points referenced in this draft"
    )
    model_name: str
    provider: str
    estimated_tokens: int = 0
