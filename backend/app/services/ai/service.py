"""
Central Generative AI Orchestrator Service for BookLeaf Publishing.
Handles classification, priority scoring, draft generation, and graceful failure degradation.
"""

import logging
from typing import Optional, Tuple
from sqlalchemy.orm import Session
from app.models.models import Ticket, Book, Author, AIDraft
from app.schemas.ai import ClassificationResult
from app.services.ai.knowledge_base import get_relevant_policies
from app.services.ai.providers import get_ai_provider, DevMockProvider

logger = logging.getLogger(__name__)


class AIService:
    @staticmethod
    def classify_and_prioritize_ticket(
        subject: str,
        description: str,
        book_title: Optional[str] = None
    ) -> Tuple[ClassificationResult, str, str]:
        """
        Classifies ticket into one of the 6 official categories and scores priority.
        Returns: (ClassificationResult, provider_name, status)
        Status is 'success' or 'fallback'.
        """
        provider, provider_name = get_ai_provider()
        try:
            result = provider.classify(subject=subject, description=description, book_title=book_title)
            return result, provider_name, "success"
        except Exception as e:
            logger.error(f"AI classification error with provider {provider_name}: {e}. Activating deterministic fallback.")
            # Fallback to dev mock provider
            try:
                fallback_provider = DevMockProvider()
                result = fallback_provider.classify(subject=subject, description=description, book_title=book_title)
                return result, "dev-mock-fallback", "fallback"
            except Exception as fe:
                logger.error(f"Fallback classification also failed: {fe}")
                # Safe emergency default
                return (
                    ClassificationResult(
                        category="General Inquiry",
                        priority="Medium",
                        confidence=0.5,
                        reasoning="Default classification due to temporary AI service unavailability."
                    ),
                    "system-default",
                    "failed"
                )

    @staticmethod
    def generate_draft_response(
        db: Session,
        ticket: Ticket,
        regenerate: bool = False
    ) -> Optional[AIDraft]:
        """
        Generates or retrieves an AI draft response for a ticket.
        If a valid draft exists and regenerate is False, returns the existing draft.
        """
        if not regenerate and ticket.ai_drafts:
            return ticket.ai_drafts[0]

        # Gather context
        author: Optional[Author] = ticket.author
        book: Optional[Book] = ticket.book

        author_name = author.name if author else "Author"
        author_data = {
            "name": author.name,
            "email": author.email,
            "joined_date": author.joined_date,
            "city": author.city,
        } if author else None

        book_data = {
            "title": book.title,
            "isbn": book.isbn,
            "status": book.status,
            "genre": book.genre,
            "publication_date": book.publication_date,
            "mrp": book.mrp,
            "author_royalty_per_copy": book.author_royalty_per_copy,
            "total_copies_sold": book.total_copies_sold,
            "total_royalty_earned": book.total_royalty_earned,
            "royalty_paid": book.royalty_paid,
            "royalty_pending": book.royalty_pending,
            "last_royalty_payout_date": book.last_royalty_payout_date,
            "print_partner": book.print_partner,
            "available_on": book.available_on or [],
        } if book else None

        # Extract only relevant policies (token-conscious knowledge retrieval)
        relevant_policies = get_relevant_policies(ticket.category, f"{ticket.subject} {ticket.description}")

        # Conversation history (last 3 public messages for context)
        history = [
            {"sender_role": m.sender_role, "message": m.message}
            for m in (ticket.messages or [])[-3:]
        ]

        provider, provider_name = get_ai_provider()
        try:
            draft_text, model_name, tokens_est = provider.generate_draft(
                author_name=author_name,
                subject=ticket.subject,
                description=ticket.description,
                book_data=book_data,
                author_data=author_data,
                policies=relevant_policies,
                history=history
            )
        except Exception as e:
            logger.error(f"Error generating AI draft with provider {provider_name}: {e}. Using rule fallback.")
            fallback = DevMockProvider()
            draft_text, model_name, tokens_est = fallback.generate_draft(
                author_name=author_name,
                subject=ticket.subject,
                description=ticket.description,
                book_data=book_data,
                author_data=author_data,
                policies=relevant_policies,
                history=history
            )
            provider_name = "dev-mock"

        # Persist draft to database
        ai_draft = AIDraft(
            ticket_id=ticket.id,
            draft_content=draft_text,
            provider=provider_name,
            model_name=model_name,
            estimated_tokens=tokens_est,
            was_edited=False
        )
        db.add(ai_draft)
        db.commit()
        db.refresh(ai_draft)
        return ai_draft

