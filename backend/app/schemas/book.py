from typing import List, Optional
from pydantic import BaseModel, ConfigDict


class BookResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    book_id: str
    author_id: str
    title: str
    isbn: Optional[str] = None
    genre: Optional[str] = None
    publication_date: Optional[str] = None
    status: str
    mrp: Optional[float] = None
    author_royalty_per_copy: Optional[float] = None
    total_copies_sold: int = 0
    total_royalty_earned: float = 0.0
    royalty_paid: float = 0.0
    royalty_pending: float = 0.0
    last_royalty_payout_date: Optional[str] = None
    print_partner: Optional[str] = None
    available_on: List[str] = []


class BookSummaryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    book_id: str
    title: str
    status: str
    isbn: Optional[str] = None

