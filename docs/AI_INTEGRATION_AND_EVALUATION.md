# BookLeaf Publishing — Generative AI Integration & Technical Strategy

## 1. Overview & Evaluation Goals

The AI integration is designed to solve BookLeaf Publishing's primary operational bottleneck: handling high-volume author inquiries regarding royalties, production stages, ISBN issues, and quality defects quickly, accurately, and consistently, without increasing human headcount linearly.

The AI system achieves three primary capabilities:
1. **Automated Ticket Classification**: Maps raw queries into exactly one of six official BookLeaf categories.
2. **Automated Priority Scoring**: Evaluates severity and financial urgency into four standardized priorities (`Critical`, `High`, `Medium`, `Low`).
3. **Context-Aware, Policy-Grounded Draft Generation**: Produces ready-to-review draft responses that sound like experienced BookLeaf operations representatives, pulling live database records and official Knowledge Base policies.

---

## 2. Multi-Provider Architecture & Graceful Degradation

AI provider logic is strictly isolated in `backend/app/services/ai/` and never directly in FastAPI route handlers:

```
                  ┌───────────────────────────────┐
                  │       AIService Orchestrator  │
                  └───────────────┬───────────────┘
                                  │
          ┌───────────────────────┼───────────────────────┐
          ▼                       ▼                       ▼
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│  GeminiProvider  │    │  OpenAIProvider  │    │  DevMockProvider │
│ official SDK     │    │ official SDK     │    │ rule-calibrated  │
│ gemini-2.5-flash │    │ gpt-4o-mini      │    │ offline fallback │
└──────────────────┘    └──────────────────┘    └──────────────────┘
```

### Supported Providers:
- **Google Gemini**: Uses official `google-genai` SDK with `gemini-2.5-flash`.
- **OpenAI**: Uses official `openai` SDK with `gpt-4o-mini`.
- **DevMockProvider (Deterministic Domain Fallback)**:
  - If no API key is configured in the environment, or if the external API times out / rate-limits, the system automatically falls back to this provider.
  - Formatted directly on the sample query-response calibrations from pages 6-7 of the PDF.
  - Returns `provider: "dev-mock"` with model name `"rule-calibrated-fallback-v1"` so it is completely transparent and never pretends to be a real model.

### Single Point of Failure (SPOF) Prevention:
If the AI provider fails completely:
- Ticket creation **never** fails.
- The ticket is created with safe default category `"General Inquiry"`, priority `"Medium"`, and status `ai_processing_status: "fallback"`.
- Admins can manually override classification, priority, and draft replies.
- Admins can trigger the "Regenerate Draft" button at any time.

---

## 3. Strict Prompt Engineering & Structured Output

### Classification & Priority Scoring Prompt
The classification system prompt (`app/services/ai/prompts.py`) requires validated JSON output adhering to Pydantic schema:

```json
{
  "category": "Royalty & Payments",
  "priority": "High",
  "confidence": 0.94,
  "reasoning": "Detected author inquiry regarding unpaid royalties exceeding standard quarterly disbursement window."
}
```

### Official Categories Enforced:
1. `Royalty & Payments`
2. `ISBN & Metadata Issues`
3. `Printing & Quality`
4. `Distribution & Availability`
5. `Book Status & Production Updates`
6. `General Inquiry`

### Priority Guidelines Applied:
- **Critical**: Severe missing royalties (>2 quarters), urgent legal/account blockages.
- **High**: ISBN errors (duplicate/wrong book linked — mandated by BookLeaf policy as high priority), serious printing defects on author copies, sudden listing unavailability during marketing.
- **Medium**: Routine royalty status checks, production timeline updates, platform stock re-sync requests.
- **Low**: General metadata inquiries (e.g. updating description or bio), package inquiries.

---

## 4. Token & Cost Consciousness

Sending the entire knowledge base and complete ticket history on every call wastes tokens and introduces context noise.

We implemented two key optimizations:
1. **Dynamic Policy Retriever (`get_relevant_policies`)**:
   Analyzes query category and intent to extract only the relevant policy sections (e.g. Royalty Policy for payment questions; ISBN Policy for metadata; Print Policy for physical copy defects).
2. **Context-Window Pruning**:
   Conversation history is strictly capped to the last 3 public messages. Database records (sales, royalties, status) are formatted compactly.
3. **Draft On-Demand**:
   Drafts are created once per ticket and persisted in `ai_drafts`. When an admin views the ticket, the existing draft is displayed without triggering redundant LLM calls.

---

## 5. Human-in-the-Loop Safeguards

1. **No Auto-Sending**: AI produces drafts only for admin review. The system never sends unreviewed messages to authors.
2. **Auditable Overrides**: If an admin changes the category or priority, the original AI predictions (`ai_category`, `ai_priority`, `ai_confidence`, `ai_reasoning`) are preserved for auditing.
3. **Draft Edit Tracking**: When an admin sends a response, the system records `was_edited: true/false` and saves the final sent message.
