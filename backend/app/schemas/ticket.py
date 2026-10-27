from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field
from app.schemas.ai import CategoryType, PriorityType


class TicketCreate(BaseModel):
    book_id: Optional[str] = Field(None, description="Book ID or null for General/Account level")
    subject: str = Field(..., min_length=3, max_length=255)
    description: str = Field(..., min_length=10)


class TicketMessageCreate(BaseModel):
    message: str = Field(..., min_length=1)


class TicketMessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    ticket_id: int
    sender_role: str  # "author" | "admin" | "system"
    sender_name: str
    sender_email: Optional[str] = None
    message: str
    created_at: datetime


class InternalNoteCreate(BaseModel):
    note: str = Field(..., min_length=1)


class InternalNoteResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    ticket_id: int
    admin_id: Optional[int] = None
    admin_name: str
    note: str
    created_at: datetime


class AIDraftResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    ticket_id: int
    draft_content: str
    provider: str
    model_name: str
    estimated_tokens: int
    was_edited: bool
    final_sent_content: Optional[str] = None
    created_at: datetime


class TicketResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    ticket_number: str
    author_id: str
    author_name: Optional[str] = None
    author_email: Optional[str] = None
    book_id: Optional[str] = None
    book_title: Optional[str] = None
    subject: str
    description: str
    category: str
    priority: str
    status: str
    ai_category: Optional[str] = None
    ai_priority: Optional[str] = None
    ai_confidence: Optional[float] = None
    ai_reasoning: Optional[str] = None
    ai_processing_status: str
    ai_provider: Optional[str] = None
    assigned_admin_id: Optional[int] = None
    assigned_admin_name: Optional[str] = None
    attachment_filename: Optional[str] = None
    attachment_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    messages: List[TicketMessageResponse] = []
    latest_message: Optional[TicketMessageResponse] = None



class TicketAdminDetailResponse(TicketResponse):
    """Admin-only view including private internal notes and AI draft history."""
    internal_notes: List[InternalNoteResponse] = []
    ai_drafts: List[AIDraftResponse] = []
    book_details: Optional[dict] = None
    author_details: Optional[dict] = None


class TicketStatusUpdate(BaseModel):
    status: str = Field(..., description="Open, In Progress, Resolved, Closed")


class TicketOverrideUpdate(BaseModel):
    category: Optional[CategoryType] = None
    priority: Optional[PriorityType] = None


class TicketAssignUpdate(BaseModel):
    admin_id: Optional[int] = None
    admin_name: Optional[str] = None


class SendAdminReplyRequest(BaseModel):
    message: str = Field(..., min_length=1)
    status_change: Optional[str] = None  # optionally update status, e.g. "In Progress" or "Resolved"
    draft_id: Optional[int] = None  # link back to AI draft if generated from one


class CategoryVolume(BaseModel):
    category: str
    count: int


class OldestUnresolvedTicket(BaseModel):
    id: int
    ticket_number: str
    subject: str
    author_name: str
    priority: str
    status: str
    age_hours: float
    created_at: datetime


class AdminDashboardStats(BaseModel):
    total_tickets: int
    open_tickets: int
    in_progress_tickets: int
    resolved_tickets: int
    closed_tickets: int
    critical_tickets: int
    high_priority_tickets: int
    category_volume: List[CategoryVolume]
    oldest_unresolved: List[OldestUnresolvedTicket]
    recent_tickets: List[TicketResponse]
