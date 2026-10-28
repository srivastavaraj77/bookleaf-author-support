from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.database import get_db
from app.core.config import settings
from app.services.ai.providers import get_ai_provider

router = APIRouter(prefix="/health", tags=["Health"])


@router.get("")
def health_check(db: Session = Depends(get_db)):
    db_status = "ok"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"error: {str(e)}"

    _, provider_name = get_ai_provider()

    return {
        "status": "healthy" if db_status == "ok" else "degraded",
        "database": db_status,
        "ai_provider": provider_name,
        "version": settings.VERSION,
        "environment": "production" if not settings.DATABASE_URL.startswith("sqlite") else "local-development"
    }

