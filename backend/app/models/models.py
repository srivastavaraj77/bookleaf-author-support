from datetime import datetime, timezone
import json
from sqlalchemy import (
    Column, Integer, String, Float, Text, Boolean, DateTime, ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from app.core.database import Base


def utc_now():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="author")  # "admin" | "author"
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    # Relationship to author profile if role == 'author'
    author_profile = relationship("Author", back_populates="user", uselist=False, cascade="all, delete-orphan")


class Author(Base):
    __tablename__ = "authors"

    id = Column(Integer, primary_key=True, index=True)
    author_id = Column(String(50), unique=True, index=True, nullable=False)  # e.g. "AUTH001"
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(50), nullable=True)
    city = Column(String(100), nullable=True)
    joined_date = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    user = relationship("User", back_populates="author_profile")
    books = relationship("Book", back_populates="author", cascade="all, delete-orphan")
    tickets = relationship("Ticket", back_populates="author", cascade="all, delete-orphan")


class Book(Base):
    __tablename__ = "books"

    id = Column(Integer, primary_key=True, index=True)
    book_id = Column(String(50), unique=True, index=True, nullable=False)  # e.g. "BK001"
    author_id = Column(String(50), ForeignKey("authors.author_id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    isbn = Column(String(100), nullable=True, index=True)
    genre = Column(String(100), nullable=True)
    publication_date = Column(String(50), nullable=True)  # "2023-06-20" or null
    status = Column(String(100), nullable=False)  # "Published & Live", "In Production - Cover Design", etc.
    mrp = Column(Float, nullable=True)
    author_royalty_per_copy = Column(Float, nullable=True)
    total_copies_sold = Column(Integer, default=0, nullable=False)
    total_royalty_earned = Column(Float, default=0.0, nullable=False)
    royalty_paid = Column(Float, default=0.0, nullable=False)
    royalty_pending = Column(Float, default=0.0, nullable=False)
    last_royalty_payout_date = Column(String(50), nullable=True)
    print_partner = Column(String(100), nullable=True)  # "In-House", "Repro India", "Epitome Books", etc.
    available_on = Column(JSON, default=list, nullable=False)  # ["Amazon India", "Flipkart", ...]
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    author = relationship("Author", back_populates="books")
    tickets = relationship("Ticket", back_populates="book")


class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)
    ticket_number = Column(String(50), unique=True, index=True, nullable=False)  # e.g. "TICK-2025-0001"
    author_id = Column(String(50), ForeignKey("authors.author_id", ondelete="CASCADE"), nullable=False, index=True)
    book_id = Column(String(50), ForeignKey("books.book_id", ondelete="SET NULL"), nullable=True, index=True)

    subject = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)

    # Active classification and priority (can be edited/overridden by admin)
    category = Column(String(100), nullable=False)  # "Royalty & Payments", etc.
    priority = Column(String(50), nullable=False, default="Medium")  # "Critical", "High", "Medium", "Low"
    status = Column(String(50), nullable=False, default="Open")  # "Open", "In Progress", "Resolved", "Closed"

    # AI Original Predictions (preserved so admin override is auditable)
    ai_category = Column(String(100), nullable=True)
    ai_priority = Column(String(50), nullable=True)
    ai_confidence = Column(Float, nullable=True)
    ai_reasoning = Column(Text, nullable=True)
    ai_processing_status = Column(String(50), nullable=False, default="pending")  # "success", "fallback", "failed", "pending"
    ai_provider = Column(String(50), nullable=True)

    # Assignment
    assigned_admin_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    assigned_admin_name = Column(String(255), nullable=True)

    # Attachment
    attachment_filename = Column(String(255), nullable=True)
    attachment_url = Column(String(500), nullable=True)

    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False, index=True)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    author = relationship("Author", back_populates="tickets")
    book = relationship("Book", back_populates="tickets")
    messages = relationship("TicketMessage", back_populates="ticket", cascade="all, delete-orphan", order_by="TicketMessage.created_at.asc()")
    internal_notes = relationship("InternalNote", back_populates="ticket", cascade="all, delete-orphan", order_by="InternalNote.created_at.asc()")
    ai_drafts = relationship("AIDraft", back_populates="ticket", cascade="all, delete-orphan", order_by="AIDraft.created_at.desc()")


class TicketMessage(Base):
    __tablename__ = "ticket_messages"

    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("tickets.id", ondelete="CASCADE"), nullable=False, index=True)
    sender_role = Column(String(50), nullable=False)  # "author" | "admin" | "system"
    sender_name = Column(String(255), nullable=False)
    sender_email = Column(String(255), nullable=True)
    message = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    ticket = relationship("Ticket", back_populates="messages")


class InternalNote(Base):
    """Admin-only internal notes strictly separated from author messages."""
    __tablename__ = "internal_notes"

    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("tickets.id", ondelete="CASCADE"), nullable=False, index=True)
    admin_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    admin_name = Column(String(255), nullable=False)
    note = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    ticket = relationship("Ticket", back_populates="internal_notes")


class AIDraft(Base):
    """Persisted AI draft responses for admin review."""
    __tablename__ = "ai_drafts"

    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("tickets.id", ondelete="CASCADE"), nullable=False, index=True)
    draft_content = Column(Text, nullable=False)
    provider = Column(String(50), nullable=False)  # "gemini" | "openai" | "dev-mock"
    model_name = Column(String(100), nullable=False)
    estimated_tokens = Column(Integer, default=0)
    was_edited = Column(Boolean, default=False)
    final_sent_content = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    ticket = relationship("Ticket", back_populates="ai_drafts")
