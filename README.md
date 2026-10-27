# BookLeaf Publishing — AI-Powered Author Support & Communication Portal

[![Python 3.12+](https://img.shields.io/badge/python-3.12+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.119+-009688.svg)](https://fastapi.tiangolo.com/)
[![React 18](https://img.shields.io/badge/React-18-61DAFB.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6.svg)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![Pytest Passed](https://img.shields.io/badge/pytest-14%2F14%20passed-brightgreen.svg)](#7-testing--quality-assurance)

A full-stack, enterprise-grade **Author Support & Communication Portal** designed specifically for **BookLeaf Publishing** to manage author communications at scale (processing 1,200+ monthly titles across a 22,000+ title catalog).

Built with **FastAPI**, **React (TypeScript + Vite + Tailwind CSS)**, **SQLAlchemy 2.x / PostgreSQL**, **Server-Sent Events (SSE)**, and **Multi-Provider Generative AI (Gemini / OpenAI / Calibrated Fallback)**.

---

## 1. Quick Start & Demo Credentials

The database is pre-seeded with the exact **10 authors and 18 books** from `bookleaf_sample_data.json`, along with initial support tickets illustrating live queue workflows.

### Demo Accounts (1-Click Fill available on Login Screen):

| Role | Email | Password | Notable Features / Context |
| :--- | :--- | :--- | :--- |
| **Admin Operations** | `admin@bookleafpub.com` | `AdminPassword123!` | Full queue triage, AI draft review, overrides, internal notes |
| **Author (AUTH001)** | `priya.sharma@email.com` | `AuthorPassword123!` | 2 published books &bull; ₹3,570 pending royalties |
| **Author (AUTH007)** | `sneha.kulkarni@email.com` | `AuthorPassword123!` | 3 books &bull; *Midnight in Mysore* **In Production (Cover Design)** |
| **Author (AUTH009)** | `kavita.deshmukh@email.com` | `AuthorPassword123!` | 2 books &bull; ₹850 pending (**Rollover threshold test**) &bull; *Raising Roots* (Typesetting) |
| **Author (AUTH002)** | `rohit.kapoor@email.com` | `AuthorPassword123!` | 2 published books &bull; ₹7,744 pending royalties |

*(All other authors `AUTH003` through `AUTH010` use the exact email from `bookleaf_sample_data.json` with password `AuthorPassword123!`)*

---

## 2. Key Features Implemented

### Author Portal (Author-Facing)
- **Email + Password JWT Authentication**: Strict RBAC ensuring authors access only their own records.
- **Author Dashboard**: Real-time aggregated metrics from the database:
  - Total Books, Published Titles, Titles in Production.
  - Total Verified Copies Sold across Amazon, Flipkart, BookLeaf Store.
  - Total Royalty Earned (80% net profit share), Royalty Paid, Royalty Pending.
  - Automated detection of ₹1,000 minimum payout threshold rollovers.
- **My Books Catalog**:
  - Filterable by status (Published vs In Production) and searchable by title/ISBN.
  - Complete fields: Title, ISBN, Genre, Publication Date, MRP, Royalty per copy, Copies Sold, Print Partner, Channels.
  - Detailed modal view with line-by-line royalty audit breakdown.
- **Submit a Support Query**:
  - Related book selector (including "General / Account Level" option).
  - Quick query topic templates (Missing Royalty, ISBN Discrepancy, Print Quality, Stock Sync).
  - Subject and detailed description validation.
  - Optional file attachment uploader (supporting JPG, PNG, PDF up to 5MB with filetype/size verification).
- **My Tickets & Real-Time Chat**:
  - Real-time conversation thread with BookLeaf operations desk.
  - Clear visual separation between author messages and admin replies.
  - Live Server-Sent Events (SSE) updates without manual page refreshing.
  - Strict privacy enforcement: **authors never receive internal admin notes**.

### Admin Portal (Admin-Facing)
- **Operations Dashboard**:
  - Real DB aggregates: Total Tickets, Open, In Progress, Critical, High, Resolved, Closed.
  - Query volume breakdown across all 6 official categories with visual percentages.
  - Oldest unresolved queries tracked with live SLA age in hours.
- **Filterable Ticket Queue**:
  - Multi-dimensional filters: Status, Category, Priority, Author, Related Book, Free-text Search.
  - Sorting by Priority (Critical &rarr; Low), Creation Date, or Age of Unresolved.
  - Urgent/Critical ticket visual indicators.
- **Ticket Detail & Management Console**:
  - Full author account metadata (Name, ID, Email, Phone, City, Joined Date).
  - Full book record with sales figures, royalty earnings, print partner, and retail channels.
  - **AI Classification & Priority Inspector**: Displays original AI predictions (`ai_category`, `ai_priority`, `ai_confidence`, `ai_reasoning`).
  - **Admin Overrides**: Full capability to manually override category and priority while preserving original AI recommendations for auditing.
  - **Private Internal Notes**: Dedicated confidential notes panel strictly isolated from the author.
  - **Ticket Assignment**: One-click self-assignment or assignment to other team members.
  - **AI-Drafted Response Panel**:
    - Context-aware draft generated using live database records and BookLeaf Knowledge Base policies.
    - Token usage estimate and model attribution.
    - One-click "Use in Reply Editor" and "Regenerate Draft" capabilities.
  - **Reply Dispatcher**: Edit draft, adjust status, and send official response (notifies author in real time).

---

## 3. Technology Stack & Justification

| Layer | Technology | Justification |
| :--- | :--- | :--- |
| **Frontend** | React 18 + TypeScript + Vite | Ultra-fast HMR, type safety, modular component hierarchy. |
| **Styling** | Tailwind CSS + Lucide Icons | Refined editorial aesthetic with bespoke typography, badges, and card states. |
| **State & API** | TanStack Query (React Query) | Declarative caching, background revalidation, optimistic updates. |
| **Backend** | Python 3.12+ / FastAPI | High-throughput asynchronous REST API, Pydantic validation, autogenerated OpenAPI docs. |
| **Database** | SQLAlchemy 2.x + Alembic | Enterprise ORM with clean migrations; supports SQLite (zero-config dev) & PostgreSQL (prod). |
| **Security** | JWT + bcrypt | Industry-standard stateless authentication and secure salted password hashing. |
| **Generative AI** | Google Gemini SDK / OpenAI SDK | Cost-effective LLMs (`gemini-2.5-flash`, `gpt-4o-mini`) + deterministic calibrated fallback. |
| **Real-Time** | Server-Sent Events (SSE) | Lightweight, firewall-friendly unidirectional push for instant ticket updates. |

---

## 4. Generative AI Architecture & Knowledge Base

AI logic is strictly decoupled in `backend/app/services/ai/`:

### A. Automatic Ticket Classification
Classifies queries into the 6 exact categories mandated by BookLeaf:
1. `Royalty & Payments`
2. `ISBN & Metadata Issues`
3. `Printing & Quality`
4. `Distribution & Availability`
5. `Book Status & Production Updates`
6. `General Inquiry`

### B. Automatic Priority Scoring
Evaluates impact, financial urgency, and policy severity:
- **Critical**: Prolonged unpaid royalties (>2 quarters), severe financial blockages.
- **High**: ISBN errors (duplicate or mismatched ISBNs flagged as High Priority by BookLeaf policy), severe print defects on delivered author copies.
- **Medium**: General royalty calculations, routine production timeline inquiries, stock re-sync requests.
- **Low**: Author bio/description updates, general marketing questions.

### C. Context-Aware Draft Generation Grounded in BookLeaf Policies
Injects author account records, live sales numbers, and specific sections from the BookLeaf Knowledge Base:
- **80/20 Royalty Split**: 80% net profit to author (MRP - printing - marketplace commission - shipping).
- **Quarterly Schedule**: Paid within 45 days of quarter end via linked bank transfer.
- **₹1,000 Threshold**: Balances under ₹1,000 automatically roll over to the next quarter.
- **48-Hour ISBN Resolution**: Confirms escalation to production team with definitive timeline.
- **Free Print Reprints**: Free reprint for verified defects (misprints, binding defects, blurry text) with photos.
- **Stock Re-sync**: Marketplace availability issues resolved within 24–48 hours via electronic feed re-sync.
- **Production Pipeline**: Manuscript Received &rarr; Editing &rarr; Cover Design &rarr; Typesetting &rarr; Proofreading &rarr; ISBN &rarr; Printing &rarr; Distribution &rarr; Live.

### D. Token & Cost Optimization
- **Rule-indexed Policy Retriever**: Extracts only the policy sections relevant to the query topic instead of sending all policies on every call.
- **Conversation History Pruning**: Limits message context to the last 3 public messages.
- **Single-Flight Generation**: Drafts are generated once and persisted in `ai_drafts`, avoiding redundant LLM API hits upon ticket reopening.

### E. Graceful Degradation & Zero-Key Fallback
If no API key is provided or the provider is unavailable:
- The ticket is **still created successfully**.
- The `DevMockProvider` uses exact policy rules and calibration examples from assignment pages 6-7 to classify the ticket and produce a draft.
- Responses are transparently tagged `provider: dev-mock` and never pretend to be a real model.

---

## 5. Local Setup Instructions

### Prerequisites
- Python 3.12+ (or Python 3.13)
- Node.js 18+ and npm

### Step 1: Clone and Set Up Backend
```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# (Optional) Set your LLM API Key in .env
# If omitted, system seamlessly runs the calibrated dev-mock provider!
cp .env.example .env

# Run database migrations and seed sample dataset (10 authors, 18 books)
python seed.py

# Launch FastAPI backend server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

FastAPI will start on `http://127.0.0.1:8000`.  
- Interactive Swagger API Documentation: `http://127.0.0.1:8000/docs`
- Health check: `http://127.0.0.1:8000/api/v1/health`

### Step 2: Set Up and Launch Frontend
In a new terminal window:
```bash
cd frontend

# Install npm dependencies
npm install

# Start Vite development server
npm run dev
```

Open your browser at `http://localhost:5173`.

*(Note: The backend also serves the compiled frontend bundle directly at `http://127.0.0.1:8000` when built via `npm run build`!)*

---

## 6. Docker Compose Deployment (PostgreSQL + Backend + Frontend)

To run the complete stack with local PostgreSQL:

```bash
docker-compose up --build
```

Services started:
- PostgreSQL on `localhost:5432`
- FastAPI backend on `http://localhost:8000`
- React production frontend on `http://localhost:5173`

---

## 7. Testing & Quality Assurance

Comprehensive automated tests verify authentication, RBAC, cross-author data isolation, ticket workflows, and AI policy retrieval:

```bash
cd backend
source venv/bin/activate
PYTHONPATH=. pytest -v
```

### Test Results Summary:
```
tests/test_auth_and_rbac.py::test_login_success_author PASSED            [  7%]
tests/test_auth_and_rbac.py::test_login_success_admin PASSED             [ 14%]
tests/test_auth_and_rbac.py::test_login_invalid_password PASSED          [ 21%]
tests/test_auth_and_rbac.py::test_author_cannot_access_admin_dashboard PASSED [ 28%]
tests/test_auth_and_rbac.py::test_admin_can_access_admin_dashboard PASSED [ 35%]
tests/test_auth_and_rbac.py::test_cross_author_book_access_forbidden PASSED [ 42%]
tests/test_author_dashboard_and_books.py::test_author_dashboard_metrics PASSED [ 50%]
tests/test_author_dashboard_and_books.py::test_author_books_list_and_search PASSED [ 57%]
tests/test_author_dashboard_and_books.py::test_knowledge_base_token_conscious_retrieval PASSED [ 64%]
tests/test_author_dashboard_and_books.py::test_file_upload_validation PASSED [ 71%]
tests/test_tickets_and_ai.py::test_author_create_ticket_with_ai_classification PASSED [ 78%]
tests/test_tickets_and_ai.py::test_author_create_ticket_general_account_level PASSED [ 85%]
tests/test_tickets_and_ai.py::test_admin_internal_notes_hidden_from_author PASSED [ 92%]
tests/test_tickets_and_ai.py::test_admin_override_classification_and_reply PASSED [100%]

======================== 14 passed in 10.16s ========================
```

---

## 8. REST API Endpoint Reference

All endpoints are versioned under `/api/v1` with consistent REST conventions:

| Method | Endpoint | Role | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/login` | Public | Authenticates user and returns JWT bearer token |
| `GET` | `/api/v1/auth/me` | Authenticated | Retrieves current authenticated user profile |
| `GET` | `/api/v1/authors/me/dashboard` | Author | Returns real-time metrics (books, sales, royalties, tickets) |
| `GET` | `/api/v1/authors/me/profile` | Author | Returns author account details |
| `GET` | `/api/v1/books` | Author | Lists author's books with search and status filters |
| `GET` | `/api/v1/books/{id}` | Author/Admin | Fetches detailed book metrics with strict ownership check |
| `POST` | `/api/v1/tickets` | Author | Creates ticket; triggers AI classification with fallback |
| `GET` | `/api/v1/tickets` | Author | Lists author's tickets with status filter |
| `GET` | `/api/v1/tickets/{id}` | Author/Admin | Fetches ticket conversation (hides internal notes from author) |
| `POST` | `/api/v1/tickets/{id}/messages` | Author | Appends author follow-up reply to conversation |
| `POST` | `/api/v1/tickets/upload` | Author | Validates and stores file attachments (size & extension checks) |
| `GET` | `/api/v1/tickets/{id}/updates` | Author/Admin | Polling fallback for real-time ticket updates |
| `GET` | `/api/v1/admin/dashboard` | Admin | Real DB aggregates (ticket counts, category volume, oldest SLA) |
| `GET` | `/api/v1/admin/tickets` | Admin | Filterable queue across all authors (status, category, priority) |
| `GET` | `/api/v1/admin/tickets/{id}` | Admin | Admin view with author context, book details, notes & AI draft |
| `PATCH`| `/api/v1/admin/tickets/{id}/status` | Admin | Updates ticket status (Open, In Progress, Resolved, Closed) |
| `PATCH`| `/api/v1/admin/tickets/{id}/override` | Admin | Overrides category and priority (preserves original AI values) |
| `PATCH`| `/api/v1/admin/tickets/{id}/assign` | Admin | Assigns ticket to self or teammate |
| `POST` | `/api/v1/admin/tickets/{id}/notes` | Admin | Adds private internal note (strictly hidden from author) |
| `POST` | `/api/v1/admin/tickets/{id}/reply` | Admin | Dispatches official reply to author and updates status |
| `POST` | `/api/v1/admin/tickets/{id}/draft/generate` | Admin | Generates or regenerates AI response draft |
| `GET` | `/api/v1/events/stream` | Authenticated | Server-Sent Events (SSE) live push stream |
| `GET` | `/api/v1/health` | Public | System health check (database & AI provider status) |

---

## 9. Assignment Requirements Verification Matrix

| Requirement from Specification | Implementation Status | Verification Details |
| :--- | :---: | :--- |
| **10 Authors & 18 Books Seeded** | ✅ Complete | Exact records from `bookleaf_sample_data.json` loaded via `seed.py`. |
| **Email/Password Auth + JWT** | ✅ Complete | `bcrypt` hashing, signed JWT tokens, protected routes, role claims. |
| **Cross-Author Isolation (RBAC)** | ✅ Complete | Verified by tests: Author A cannot access Author B's books/tickets. |
| **Author Dashboard KPIs** | ✅ Complete | Real DB calculations: books, sold, royalty earned, paid, pending. |
| **My Books & Detailed View** | ✅ Complete | Books in production handled; MRP null, zero royalties, platforms. |
| **Submit Query Form** | ✅ Complete | Book selector, General option, description, attachment validation. |
| **Real-Time Updates** | ✅ Complete | Server-Sent Events (SSE) `/events/stream` + polling fallback. |
| **Admin Operations Dashboard** | ✅ Complete | Total, Open, In Progress, Critical, High, Resolved, SLA ages. |
| **Filterable Ticket Queue** | ✅ Complete | Filters by status, category, priority, author, search, and sorting. |
| **AI 6-Category Auto-Classification** | ✅ Complete | Exact official categories, structured JSON, Pydantic validation. |
| **AI Priority Scoring (4 Levels)** | ✅ Complete | `Critical`, `High`, `Medium`, `Low` with documented heuristics. |
| **AI-Drafted Response** | ✅ Complete | Grounded in Knowledge Base (80/20, ₹1000 threshold, 48h ISBN SLA). |
| **Admin Overrides & Auditing** | ✅ Complete | Admin overrides category/priority; original AI fields preserved. |
| **Private Internal Notes** | ✅ Complete | Admin notes strictly separated; author schemas never expose them. |
| **Graceful Degradation** | ✅ Complete | Zero SPOF: Ticket creation succeeds even if AI service is offline. |
| **Docker Compose & Deployment** | ✅ Complete | Configured for PostgreSQL and separate containerized hosting. |
| **Documentation & Write-Up** | ✅ Complete | `README.md`, `ARCHITECTURE.md`, `AI_INTEGRATION_AND_EVALUATION.md`, `ONE_PAGE_WRITEUP.md`. |
