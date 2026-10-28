from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_author, get_current_user
from app.models.models import Book, Author, User
from app.schemas.book import BookResponse

router = APIRouter(prefix="/books", tags=["Books"])


@router.get("", response_model=List[BookResponse])
def get_my_books(
    search: Optional[str] = Query(None, description="Search by title or ISBN"),
    status_filter: Optional[str] = Query(None, alias="status"),
    genre: Optional[str] = None,
    current_author: Author = Depends(get_current_author),
    db: Session = Depends(get_db)
):
    query = db.query(Book).filter(Book.author_id == current_author.author_id)

    if search:
        term = f"%{search.strip()}%"
        query = query.filter((Book.title.ilike(term)) | (Book.isbn.ilike(term)))

    if status_filter and status_filter != "all":
        query = query.filter(Book.status.ilike(f"%{status_filter}%"))

    if genre and genre != "all":
        query = query.filter(Book.genre.ilike(f"%{genre}%"))

    return query.order_by(Book.id.asc()).all()


@router.get("/{book_id}", response_model=BookResponse)
def get_book_details(
    book_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    book = db.query(Book).filter((Book.book_id == book_id) | (Book.id == (int(book_id) if book_id.isdigit() else -1))).first()
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Book with identifier '{book_id}' was not found."
        )

    # Authorization verification: Admin can access any book; Author can only access their own
    if current_user.role != "admin":
        author = db.query(Author).filter(Author.user_id == current_user.id).first()
        if not author:
            author = db.query(Author).filter(Author.email == current_user.email).first()

        if not author or author.author_id != book.author_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have authorization to view this book record."
            )

    return book

