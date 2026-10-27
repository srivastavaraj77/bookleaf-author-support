from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_author
from app.models.models import Author, Book, Ticket
from app.schemas.author import AuthorProfileResponse, AuthorDashboardStats

router = APIRouter(prefix="/authors", tags=["Authors"])


@router.get("/me/profile", response_model=AuthorProfileResponse)
def get_my_profile(current_author: Author = Depends(get_current_author)):
    return current_author


@router.get("/me/dashboard", response_model=AuthorDashboardStats)
def get_author_dashboard(
    current_author: Author = Depends(get_current_author),
    db: Session = Depends(get_db)
):
    books = db.query(Book).filter(Book.author_id == current_author.author_id).all()
    tickets = db.query(Ticket).filter(Ticket.author_id == current_author.author_id).all()

    total_books = len(books)
    published_books = sum(1 for b in books if "Published" in (b.status or ""))
    books_in_production = total_books - published_books

    total_copies_sold = sum(b.total_copies_sold or 0 for b in books)
    total_royalty_earned = sum(b.total_royalty_earned or 0.0 for b in books)
    royalty_paid = sum(b.royalty_paid or 0.0 for b in books)
    royalty_pending = sum(b.royalty_pending or 0.0 for b in books)

    open_tickets_count = sum(1 for t in tickets if t.status in ["Open", "In Progress"])
    recent_tickets_count = len(tickets)

    return AuthorDashboardStats(
        author_id=current_author.author_id,
        author_name=current_author.name,
        total_books=total_books,
        published_books=published_books,
        books_in_production=books_in_production,
        total_copies_sold=total_copies_sold,
        total_royalty_earned=total_royalty_earned,
        royalty_paid=royalty_paid,
        royalty_pending=royalty_pending,
        open_tickets_count=open_tickets_count,
        recent_tickets_count=recent_tickets_count
    )
