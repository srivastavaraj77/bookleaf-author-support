from typing import List, Optional
from pydantic import BaseModel, ConfigDict, EmailStr
from app.schemas.book import BookResponse


class AuthorProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    author_id: str
    name: str
    email: EmailStr
    phone: Optional[str] = None
    city: Optional[str] = None
    joined_date: Optional[str] = None



class AuthorDashboardStats(BaseModel):
    author_id: str
    author_name: str
    total_books: int
    published_books: int
    books_in_production: int
    total_copies_sold: int
    total_royalty_earned: float
    royalty_paid: float
    royalty_pending: float
    open_tickets_count: int
    recent_tickets_count: int
