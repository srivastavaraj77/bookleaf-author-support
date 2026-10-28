"""
Official BookLeaf Publishing Knowledge Base and Policy Context.
Extracted verbatim and structured directly from the BookLeaf Technical Assignment specification.
"""

COMPANY_OVERVIEW = """
BookLeaf Publishing Company Overview:
- BookLeaf Publishing is a self-publishing company operating in India and the US.
- Publishing packages:
  * Standard Free: No upfront cost.
  * Bestseller Breakthrough: Premium, paid package with marketing and distribution add-ons.
- Core services: Cover design, typesetting, ISBN assignment, printing, distribution, and royalty management for authors.
- Facilities & Partners: In-house printing facility and warehouse are located in Delhi. Also partners with external print facilities including Repro India and Epitome Books.
"""

ROYALTY_POLICY = """
BookLeaf Royalty Policy:
- Royalty Split: 80/20 split — 80% of net profit per book goes to the author, 20% to BookLeaf.
- Net Profit Calculation: Net profit = MRP minus printing cost, platform commission (Amazon/Flipkart), and shipping charges.
- Payout Schedule: Royalties are calculated quarterly and paid within 45 days of the quarter ending.
- Minimum Payout Threshold: ₹1,000. If accumulated royalties are below ₹1,000, they roll over to the next quarter.
- Payment Method: Direct bank transfer to the account linked in the author's dashboard.
- Reporting: Authors can view a detailed royalty breakdown in their dashboard, showing sales figures per platform.
"""

ISBN_POLICY = """
BookLeaf ISBN Policy:
- Unique Assignment: Every book published through BookLeaf receives a unique ISBN assigned by BookLeaf.
- Imprint: ISBNs are registered under BookLeaf's publisher imprint. If an author wants an ISBN under their own imprint, they must obtain it independently.
- Error Escalation: If an author reports an ISBN error (duplicate ISBN, wrong book linked on platforms), it is treated as HIGH-PRIORITY and immediately escalated to the production team with a 48-hour resolution timeline.
"""

PRINTING_AND_QUALITY_POLICY = """
BookLeaf Printing & Quality Policy:
- Production Routing: In-house printing handles most orders. Overflow or specific format requirements go to Repro India or Epitome Books.
- Standard Turnaround: 5–7 business days from order confirmation.
- Quality Defects: If an author reports a quality issue (misprints, binding defects, color inconsistency, blurry pages, misaligned cuts), BookLeaf arranges a 100% free reprint once verified.
- Verification Requirement: The author must share clear photos of the defective copies to initiate the replacement. Turnaround for reprints is 5–7 business days.
"""

DISTRIBUTION_POLICY = """
BookLeaf Distribution & Availability Policy:
- Supported Platforms: Amazon India, Flipkart, Amazon US, Amazon UK, and the direct BookLeaf Store.
- Listing Timeline: New listings typically go live within 7–10 business days after publication is complete.
- Availability / Stock Sync Issues: If a published book shows as "Currently Unavailable" or "Out of Stock" on an online platform, it usually indicates a stock synchronization issue. BookLeaf's distribution team can trigger an electronic re-sync within 24–48 hours to restore availability.
"""

PRODUCTION_STAGES_POLICY = """
BookLeaf Production Stages:
- Stage Order:
  1. Manuscript Received
  2. Editing (if opted in package)
  3. Cover Design
  4. Typesetting
  5. Proofreading
  6. ISBN Assignment
  7. Printing
  8. Distribution Setup
  9. Published & Live
- Communication: Authors are updated at each stage via email and dashboard tracking.
- Common Bottlenecks: Delays typically happen at Cover Design (waiting for author feedback/approval) and Proofreading (author revision rounds).
- Metadata Updates: Updates to title, description, or bio after publication can be submitted via the dashboard or email and typically reflect on retail platforms within 3–5 business days.
"""

COMMUNICATION_TONE_GUIDELINES = """
BookLeaf Communication Tone Guidelines:
- Empathetic and Professional: Authors are our creative partners, not customers to be managed.
- Acknowledge First: Always validate and acknowledge the author's concern or frustration before jumping to solutions or explanations.
- Be Specific: Include actual numbers, sales figures, payout dates, and production statuses from the database rather than vague reassurances.
- Own Responsibility Directly: If something is BookLeaf's fault (delayed royalties, ISBN error, print quality defect), own it directly without corporate deflection or defensive language.
- Clear Timelines: When an issue requires investigation or escalation, provide a definite timeline (e.g. "within 48 hours", "5-7 business days") rather than open-ended promises.
- Actionable Conclusion: Always conclude with a clear next step for both the author and the BookLeaf operations team.
- Zero Hallucination Rule: Never fabricate payment transaction IDs, fake dispatch numbers, unverified production dates, or false promises.
"""

POLICY_SECTIONS = {
    "royalty": ROYALTY_POLICY,
    "isbn": ISBN_POLICY,
    "printing": PRINTING_AND_QUALITY_POLICY,
    "distribution": DISTRIBUTION_POLICY,
    "production": PRODUCTION_STAGES_POLICY,
    "company": COMPANY_OVERVIEW,
}


def get_relevant_policies(category: str, query_text: str) -> str:
    """
    Token-conscious knowledge base retriever.
    Extracts only the relevant policies needed for a specific query to avoid
    needlessly sending the entire knowledge base on every LLM call.
    """
    text_lower = f"{category} {query_text}".lower()
    selected = [COMPANY_OVERVIEW]

    if any(k in text_lower for k in ["royalty", "payment", "bank", "payout", "earned", "money", "split", "threshold", "quarter", "1000"]):
        selected.append(ROYALTY_POLICY)

    if any(k in text_lower for k in ["isbn", "barcode", "imprint", "wrong book"]):
        selected.append(ISBN_POLICY)

    if any(k in text_lower for k in ["print", "quality", "page", "binding", "blurry", "paper", "copy", "copies", "defect", "reprint"]):
        selected.append(PRINTING_AND_QUALITY_POLICY)

    if any(k in text_lower for k in ["distribution", "available", "unavailable", "amazon", "flipkart", "listing", "stock", "out of stock", "store"]):
        selected.append(DISTRIBUTION_POLICY)

    if any(k in text_lower for k in ["status", "stage", "typesetting", "cover", "proofread", "proof", "manuscript", "production", "live", "metadata", "description"]):
        selected.append(PRODUCTION_STAGES_POLICY)

    # If no specific policy matched, include royalty, distribution and production as general baseline
    if len(selected) == 1:
        selected.extend([ROYALTY_POLICY, DISTRIBUTION_POLICY, PRODUCTION_STAGES_POLICY])

    return "\n\n".join(selected)

