# BookLeaf Publishing — System Architecture & Design Specification

## 1. System Overview

BookLeaf Publishing processes **1,200+ titles monthly** across an active catalog of **22,000+ books** for thousands of authors in India and the United States. Author inquiries regarding royalties, ISBN mismatches, print defects, production stages, and distribution availability create significant operational load.

This application provides a **bidirectional, role-isolated, AI-augmented portal**:
1. **Author Portal**: An editorial self-service dashboard to monitor royalties, book lifecycle stages, sales metrics, and raise inquiries with real-time updates.
2. **Admin Portal**: A high-efficiency operations queue with automated AI classification, priority scoring, token-conscious knowledge base draft generation, confidential internal notes, and audit tracking.

---

## 2. Architectural Blueprint

```
 ┌─────────────────────────────────────────────────────────────┐
 │                      REACT + VITE SPA                       │
 │  ┌───────────────────────────────┐ ┌──────────────────────┐ │
 │  │        Author Portal          │ │     Admin Portal     │ │
 │  │  • Real-Time Dashboard        │ │  • Filterable Queue  │ │
 │  │  • My Books & Royalties       │ │  • SLA Tracking      │ │
 │  │  • Ticket Chat & Attachments  │ │  • AI Draft Review   │ │
 │  └──────────────┬────────────────┘ └──────────┬───────────┘ │
 └─────────────────┼─────────────────────────────┼─────────────┘
                   │  REST API / SSE Streams     │
                   ▼                             ▼
 ┌─────────────────────────────────────────────────────────────┐
 │                  FASTAPI BACKEND SERVICE                    │
 │                                                             │
 │  ┌───────────────────────┐       ┌───────────────────────┐  │
 │  │    Auth Middleware    │       │   Real-Time SSE Hub   │  │
 │  │  JWT + Role-Based RBAC│       │  Live event streaming │  │
 │  └───────────┬───────────┘       └───────────▲───────────┘  │
 │              │                               │              │
 │  ┌───────────▼───────────┐       ┌───────────┴───────────┐  │
 │  │   Business Services   │◄─────►│   AI Orchestration    │  │
 │  │  Tickets, Books, Notes│       │  Classifier & Drafter │  │
 │  └───────────┬───────────┘       └───────────┬───────────┘  │
 └──────────────┼───────────────────────────────┼──────────────┘
                │                               │
                ▼                               ▼
 ┌───────────────────────────┐     ┌───────────────────────────┐
 │   PostgreSQL / SQLite     │     │     AI Providers          │
 │  • Users & Authors        │     │  • Google Gemini SDK      │
 │  • Books & Royalties      │     │  • OpenAI SDK             │
 │  • Tickets, Msgs & Notes  │     │  • Dev Mock Fallback      │
 └───────────────────────────┘     └───────────────────────────┘
```

---

## 3. Database Schema & Data Integrity

Designed with strict relational integrity, primary keys, foreign keys with cascade policies, and unique constraints:

- `users`: Identity credentials with `bcrypt` password hashing, `role` ("admin" | "author"), and active status.
- `authors`: Author profiles (`AUTH001` - `AUTH010`), linked to `users.id`, tracking contact and joined dates.
- `books`: Complete catalog representation (`BK001` - `BK018`) with fields for `isbn`, `genre`, `status` ("Published & Live" or "In Production - Cover Design/Typesetting"), `mrp`, `author_royalty_per_copy`, `total_copies_sold`, `total_royalty_earned`, `royalty_paid`, `royalty_pending`, `last_royalty_payout_date`, `print_partner`, and `available_on` (JSON array).
- `tickets`: Operational tickets with `ticket_number`, active `category` and `priority`, original `ai_category` and `ai_priority`, `ai_confidence`, `ai_reasoning`, `ai_processing_status`, `assigned_admin_id`, and timestamps.
- `ticket_messages`: End-to-end audit trail of public messages exchanged between authors and admins.
- `internal_notes`: Admin-only private annotations strictly isolated from author API endpoints.
- `ai_drafts`: Versioned AI draft responses, tracking provider, model name, estimated tokens, and whether the admin edited the draft before dispatch.

---

## 4. Role-Based Access Control (RBAC) & Data Isolation

Security is enforced at the dependency layer (`app/api/deps.py`):
1. **Author Scope Isolation**:
   - `get_current_author` retrieves the author profile matching the authenticated user.
   - Any query for `/api/v1/books/{id}` or `/api/v1/tickets/{id}` verifies that `ticket.author_id == current_author.author_id`.
   - Modifying URL IDs to access another author's records returns `403 Forbidden`.
2. **Confidential Internal Notes**:
   - Internal notes are stored in `internal_notes` table.
   - Author API response schemas explicitly omit the `internal_notes` relation.
   - Only admin endpoints (`/api/v1/admin/tickets/{id}`) serialize internal notes.
3. **Admin Privilege Verification**:
   - All endpoints under `/api/v1/admin/*` require `get_current_admin`. Non-admin tokens are immediately rejected with `403 Forbidden`.

---

## 5. Real-Time Architecture (Server-Sent Events)

Instead of requiring manual page refreshes, the application implements Server-Sent Events (SSE) via Starlette/FastAPI:
- Connection endpoint: `GET /api/v1/events/stream?token=...`
- Clients subscribe to an asynchronous event queue upon page load.
- When an admin sends a response, changes ticket status, or updates assignment, the event is immediately pushed to the author's browser stream.
- The React frontend receives the event and invalidates TanStack Query caches, seamlessly updating the chat timeline and badges without layout shifts.
- Short polling fallback (`GET /api/v1/tickets/{id}/updates?since=...`) is also provided for environments where long-lived HTTP streaming is restricted.

