from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password, create_access_token
from app.models.models import User, Author
from app.schemas.auth import LoginRequest, TokenResponse, UserResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    email = payload.email.lower().strip()
    user = db.query(User).filter(User.email == email).first()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive. Please contact support."
        )

    # Determine author_id if user is an author
    author_id = None
    if user.role == "author":
        author = db.query(Author).filter(Author.user_id == user.id).first()
        if not author:
            author = db.query(Author).filter(Author.email == user.email).first()
        if author:
            author_id = author.author_id

    access_token = create_access_token(
        subject=user.id,
        role=user.role,
        author_id=author_id,
        name=user.full_name
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        role=user.role,
        user_id=user.id,
        author_id=author_id,
        name=user.full_name,
        email=user.email,
    )


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    author_id = None
    if current_user.role == "author":
        author = db.query(Author).filter(Author.user_id == current_user.id).first()
        if not author:
            author = db.query(Author).filter(Author.email == current_user.email).first()
        if author:
            author_id = author.author_id

    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        role=current_user.role,
        is_active=current_user.is_active,
        author_id=author_id
    )
