# BookLeaf Publishing — Technical Evaluation Write-Up

**Candidate**: Senior Full-Stack Developer Position  
**Role**: Author Support & Communication Portal  
**Stack**: Python (FastAPI) &bull; React (TypeScript + Vite + Tailwind CSS) &bull; PostgreSQL &bull; Generative AI (Gemini / OpenAI / Calibrated Fallback)

---

### 1. Approach & Priorities

When designing this system, I prioritized **operational reliability, role isolation, and high-fidelity AI domain alignment** over superficial UI vanity:

1. **Domain-Calibrated AI Grounding**: Rather than relying on generic AI responses, I built a structured Knowledge Base retriever that grounds drafts in BookLeaf's actual operating rules (80/20 net profit split, quarterly payout within 45 days, ₹1,000 threshold rollover, 48-hour ISBN escalation, 5-7 day reprint turnaround).
2. **Absolute Data Isolation & Security**: Author endpoints enforce strict ownership checks. An author attempting to view another author's book or ticket via URL tampering receives a `403 Forbidden`. Confidential internal notes are strictly isolated in a dedicated table and schema, guaranteeing they can never leak to the author.
3. **Resilience to AI Outages**: The AI service was designed so ticket creation never depends on third-party model availability. If an LLM API times out or is offline, the system falls back seamlessly to deterministic rule classification, logging the audit status without disrupting the author experience.
4. **Real-Time Responsiveness**: Server-Sent Events (SSE) provide live ticket status and message synchronization, with transparent short-polling as a fallback.

---

### 2. Engineering Trade-offs

| Decision | Chosen Solution | Trade-Off & Justification |
| :--- | :--- | :--- |
| **Real-Time Mechanism** | Server-Sent Events (SSE) with polling fallback | SSE provides simpler firewall traversal and unidirectional push without the connection overhead of full-duplex WebSockets. |
| **Knowledge Base Retrieval** | Rule-indexed keyword policy selector | Avoided introducing an oversized vector database (Pinecone/Chroma) for a focused 6-page knowledge base; this saves token latency and compute while guaranteeing 100% policy recall. |
| **Database Flexibility** | Dual-mode SQLAlchemy (SQLite dev / PostgreSQL prod) | Enables immediate zero-dependency evaluation locally (`bookleaf.db`), while fully supporting PostgreSQL in Docker Compose for production. |
| **Human-in-the-Loop** | Admin-reviewed draft dispatch | Drafts are never sent automatically; this protects BookLeaf from unintended financial or contractual commitments. |

---

### 3. Production Evolution Plan

If deploying this platform to handle BookLeaf's full catalog (22,000+ titles, 1,200+ monthly books):

1. **Background Job Queuing**: Offload heavy LLM classification and PDF/photo attachment processing to **Celery with Redis** or **Google Cloud Tasks**, ensuring FastAPI HTTP threads remain under 50ms.
2. **Semantic Knowledge Base Embeddings**: Implement hybrid search (pgvector + BM25) as the Knowledge Base expands across regional Indian publishing contracts and foreign translation rights.
3. **Multi-Channel Author Integrations**: Extend the ingestion layer to accept queries from WhatsApp Business API and email (SendGrid/Mailgun webhook), routing them into the same unified admin queue.
4. **Automated SLA Escalation Cron**: Add automatic priority escalation for tickets unaddressed after 24 hours, alerting operations leads via Slack/PagerDuty.
5. **Author Self-Service Payout Tracking**: Integrate directly with payment gateways (RazorpayX / Cashfree) to provide live bank UTR numbers on author dashboards once payouts are executed.
