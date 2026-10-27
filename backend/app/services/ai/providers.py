"""
AI Provider abstraction supporting Google Gemini, OpenAI, and a transparent Development Mock Provider.
"""

import json
import logging
import os
import re
from abc import ABC, abstractmethod
from typing import Optional, Tuple
from app.core.config import settings
from app.schemas.ai import ClassificationResult, CategoryType, PriorityType

logger = logging.getLogger(__name__)


class BaseLLMProvider(ABC):
    @abstractmethod
    def classify(self, subject: str, description: str, book_title: Optional[str] = None) -> ClassificationResult:
        pass

    @abstractmethod
    def generate_draft(
        self,
        author_name: str,
        subject: str,
        description: str,
        book_data: Optional[dict],
        author_data: Optional[dict],
        policies: str,
        history: Optional[list[dict]] = None
    ) -> Tuple[str, str, int]:
        """Returns (draft_content, model_name, estimated_tokens)"""
        pass


class GeminiProvider(BaseLLMProvider):
    def __init__(self, api_key: str, model_name: str = "gemini-2.5-flash"):
        self.api_key = api_key
        self.model_name = model_name
        from google import genai
        self.client = genai.Client(api_key=api_key)

    def classify(self, subject: str, description: str, book_title: Optional[str] = None) -> ClassificationResult:
        from app.services.ai.prompts import CLASSIFICATION_SYSTEM_PROMPT, build_classification_user_prompt
        user_prompt = build_classification_user_prompt(subject, description, book_title)

        prompt = f"{CLASSIFICATION_SYSTEM_PROMPT}\n\n{user_prompt}"
        response = self.client.models.generate_content(
            model=self.model_name,
            contents=prompt,
        )
        raw_text = response.text or "{}"
        # Extract JSON substring if markdown formatted
        json_match = re.search(r"\{.*\}", raw_text, re.DOTALL)
        if json_match:
            data = json.loads(json_match.group(0))
        else:
            data = json.loads(raw_text)

        return ClassificationResult(
            category=data["category"],
            priority=data["priority"],
            confidence=float(data.get("confidence", 0.9)),
            reasoning=data.get("reasoning", "Classified by Gemini AI")
        )

    def generate_draft(
        self,
        author_name: str,
        subject: str,
        description: str,
        book_data: Optional[dict],
        author_data: Optional[dict],
        policies: str,
        history: Optional[list[dict]] = None
    ) -> Tuple[str, str, int]:
        from app.services.ai.prompts import DRAFT_RESPONSE_SYSTEM_PROMPT, build_draft_user_prompt
        user_prompt = build_draft_user_prompt(
            author_name=author_name,
            subject=subject,
            description=description,
            book_data=book_data,
            author_data=author_data,
            policies_context=policies,
            conversation_history=history
        )
        prompt = f"{DRAFT_RESPONSE_SYSTEM_PROMPT}\n\n{user_prompt}"
        response = self.client.models.generate_content(
            model=self.model_name,
            contents=prompt,
        )
        draft_text = response.text.strip() if response.text else "Thank you for reaching out to BookLeaf Publishing."
        tokens = int(len(prompt.split()) * 1.3)
        return draft_text, self.model_name, tokens


class OpenAIProvider(BaseLLMProvider):
    def __init__(self, api_key: str, model_name: str = "gpt-4o-mini"):
        self.api_key = api_key
        self.model_name = model_name
        from openai import OpenAI
        self.client = OpenAI(api_key=api_key)

    def classify(self, subject: str, description: str, book_title: Optional[str] = None) -> ClassificationResult:
        from app.services.ai.prompts import CLASSIFICATION_SYSTEM_PROMPT, build_classification_user_prompt
        user_prompt = build_classification_user_prompt(subject, description, book_title)

        response = self.client.chat.completions.create(
            model=self.model_name,
            messages=[
                {"role": "system", "content": CLASSIFICATION_SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.1
        )
        raw_text = response.choices[0].message.content or "{}"
        data = json.loads(raw_text)

        return ClassificationResult(
            category=data["category"],
            priority=data["priority"],
            confidence=float(data.get("confidence", 0.9)),
            reasoning=data.get("reasoning", "Classified by OpenAI model")
        )

    def generate_draft(
        self,
        author_name: str,
        subject: str,
        description: str,
        book_data: Optional[dict],
        author_data: Optional[dict],
        policies: str,
        history: Optional[list[dict]] = None
    ) -> Tuple[str, str, int]:
        from app.services.ai.prompts import DRAFT_RESPONSE_SYSTEM_PROMPT, build_draft_user_prompt
        user_prompt = build_draft_user_prompt(
            author_name=author_name,
            subject=subject,
            description=description,
            book_data=book_data,
            author_data=author_data,
            policies_context=policies,
            conversation_history=history
        )
        response = self.client.chat.completions.create(
            model=self.model_name,
            messages=[
                {"role": "system", "content": DRAFT_RESPONSE_SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.3
        )
        draft_text = response.choices[0].message.content or ""
        tokens = response.usage.total_tokens if response.usage else 0
        return draft_text.strip(), self.model_name, tokens


class DevMockProvider(BaseLLMProvider):
    """
    High-fidelity development & test fallback provider.
    Runs when no API key is configured or when the remote LLM is unreachable.
    Uses exact BookLeaf policies and calibration examples from assignment pages 5-7.
    Explicitly identifies as 'dev-mock' to ensure transparency.
    """
    def __init__(self, model_name: str = "bookleaf-rule-calibrated-v1"):
        self.model_name = model_name

    def classify(self, subject: str, description: str, book_title: Optional[str] = None) -> ClassificationResult:
        text = f"{subject} {description}".lower()

        # 1. ISBN & Metadata
        if any(w in text for w in ["isbn", "barcode", "wrong book linked", "different isbn"]):
            return ClassificationResult(
                category="ISBN & Metadata Issues",
                priority="High",
                confidence=0.95,
                reasoning="Identified critical ISBN or catalog identifier discrepancy requiring production team escalation."
            )

        # 2. Printing & Quality
        if any(w in text for w in ["print", "blurry", "misaligned", "binding", "terrible", "defect", "pages", "paper quality", "copies damaged", "author copies"]):
            priority = "High" if any(w in text for w in ["terrible", "defect", "damaged", "blurry", "misaligned"]) else "Medium"
            return ClassificationResult(
                category="Printing & Quality",
                priority=priority,
                confidence=0.92,
                reasoning="Identified printing quality or physical copy defect report."
            )

        # 3. Royalty & Payments
        if any(w in text for w in ["royalty", "payment", "bank", "payout", "haven't received", "too low", "sold", "profit", "threshold", "earnings"]):
            # Check for prolonged non-payment or urgency
            if any(w in text for w in ["months", "never", "not received", "missing", "overdue", "unpaid"]):
                priority = "High"
            else:
                priority = "Medium"
            return ClassificationResult(
                category="Royalty & Payments",
                priority=priority,
                confidence=0.94,
                reasoning="Detected author inquiry regarding royalty calculation, payout timeline, or sales earnings."
            )

        # 4. Distribution & Availability
        if any(w in text for w in ["unavailable", "out of stock", "amazon", "flipkart", "listing", "store", "distribution"]):
            return ClassificationResult(
                category="Distribution & Availability",
                priority="Medium",
                confidence=0.90,
                reasoning="Detected platform availability or stock sync status query."
            )

        # 5. Book Status & Production Updates
        if any(w in text for w in ["typesetting", "cover", "proofreading", "manuscript", "production", "stage", "when will it be done", "timeline", "in production"]):
            priority = "High" if any(w in text for w in ["weeks", "delayed", "stuck", "still"]) else "Medium"
            return ClassificationResult(
                category="Book Status & Production Updates",
                priority=priority,
                confidence=0.91,
                reasoning="Detected manuscript production milestone or publication progress check."
            )

        # 6. General Inquiry
        return ClassificationResult(
            category="General Inquiry",
            priority="Low",
            confidence=0.88,
            reasoning="Routine author account, metadata update, or general informational question."
        )

    def generate_draft(
        self,
        author_name: str,
        subject: str,
        description: str,
        book_data: Optional[dict],
        author_data: Optional[dict],
        policies: str,
        history: Optional[list[dict]] = None
    ) -> Tuple[str, str, int]:
        text = f"{subject} {description}".lower()
        first_name = author_name.split()[0] if author_name else "Author"
        book_title = book_data.get("title") if book_data else "your book"
        mrp = book_data.get("mrp") if book_data else None
        pending = book_data.get("royalty_pending", 0) if book_data else 0
        copies = book_data.get("total_copies_sold", 0) if book_data else 0
        status = book_data.get("status") if book_data else "Published & Live"

        # Match calibrated scenarios from PDF pages 6-7
        if "isbn" in text:
            draft = (
                f"Dear {first_name},\n\n"
                f"Thank you for reaching out to us regarding the ISBN details for \"{book_title}\".\n\n"
                f"We treat ISBN and catalog discrepancies with the highest priority, as accurate metadata is vital "
                f"across all distribution channels. We sincerely apologize for any confusion this issue has caused.\n\n"
                f"I have immediately escalated this ticket to our senior production and data management team for a full review. "
                f"We will verify the ISBN assignment against our official records and coordinate with retail partners to correct any listing errors.\n\n"
                f"Our team will investigate and update you within 48 hours with resolution details.\n\n"
                f"Warm regards,\n"
                f"BookLeaf Author Support Operations Team"
            )
        elif any(w in text for w in ["blurry", "defect", "misaligned", "terrible", "print", "binding"]):
            draft = (
                f"Dear {first_name},\n\n"
                f"Thank you for contacting us, and please accept our sincere apologies regarding the print quality issue "
                f"you experienced with your copies of \"{book_title}\". We hold our print operations to strict standards, and "
                f"we are sorry that this order fell short.\n\n"
                f"Under BookLeaf's Quality Guarantee, any verified printing or binding defects qualify for a 100% free reprint. "
                f"To help us process this immediately with our Delhi production facility, could you please reply with 2–3 clear photographs "
                f"showing the defective pages and binding?\n\n"
                f"Once verified, we will dispatch a replacement print run within 5–7 business days at no cost to you.\n\n"
                f"Warm regards,\n"
                f"BookLeaf Author Support Operations Team"
            )
        elif any(w in text for w in ["unavailable", "out of stock"]):
            draft = (
                f"Dear {first_name},\n\n"
                f"Thank you for bringing this to our attention regarding \"{book_title}\".\n\n"
                f"When a published book appears as \"Currently Unavailable\" on Amazon or Flipkart, it typically indicates a temporary "
                f"inventory metadata synchronization issue between the marketplace feeds and our central distribution system rather than an actual stock shortage.\n\n"
                f"Our distribution team has initiated an automated re-sync with the platforms. Listings typically refresh and show available for ordering "
                f"within 24–48 hours.\n\n"
                f"We are monitoring the listing and will follow up with you as soon as the status is live again.\n\n"
                f"Warm regards,\n"
                f"BookLeaf Author Support Operations Team"
            )
        elif any(w in text for w in ["typesetting", "cover", "manuscript", "when will it be done", "still in", "progress"]):
            draft = (
                f"Dear {first_name},\n\n"
                f"Thank you for reaching out for an update on \"{book_title}\".\n\n"
                f"According to our production records, your title is currently in the \"{status}\" stage. We truly appreciate your patience as we "
                f"take the necessary care to ensure the interior layout, cover design, and formatting meet the highest publishing standards.\n\n"
                f"Our editorial team is completing the current round of review and will share the proofs for your approval within 3–4 business days. "
                f"Once you review and approve the draft, we will proceed directly to the ISBN assignment and printing stages.\n\n"
                f"Please let us know if you have any questions in the meantime.\n\n"
                f"Warm regards,\n"
                f"BookLeaf Production & Support Team"
            )
        elif any(w in text for w in ["royalty", "payment", "bank", "payout", "haven't received", "too low"]):
            if pending < 1000 and pending > 0:
                draft = (
                    f"Dear {first_name},\n\n"
                    f"Thank you for contacting us regarding your royalty earnings for \"{book_title}\".\n\n"
                    f"Our records show that your current pending royalty stands at ₹{pending:,.2f} from {copies} copies sold. "
                    f"Under BookLeaf's royalty policy, royalties are calculated quarterly with a minimum payout threshold of ₹1,000. "
                    f"Because your current balance is under ₹1,000, it has rolled over to the current quarter and will be disbursed "
                    f"automatically once the threshold is reached.\n\n"
                    f"Payouts are disbursed via direct bank transfer within 45 days after the close of each quarter. "
                    f"Please ensure your bank account details are up to date in your author portal dashboard.\n\n"
                    f"Warm regards,\n"
                    f"BookLeaf Author Support Operations Team"
                )
            else:
                draft = (
                    f"Dear {first_name},\n\n"
                    f"Thank you for contacting us regarding your royalty earnings for \"{book_title}\". We completely understand how important "
                    f"timely royalty disbursement and clear reporting are to you as an author.\n\n"
                    f"As per BookLeaf's royalty policy, authors receive 80% of net profit (calculated as MRP minus printing costs, marketplace platform commissions, and shipping charges). "
                    f"Royalties are calculated on a quarterly schedule and disbursed within 45 days of the quarter ending.\n\n"
                    f"Our records show that your title has sold {copies} copies, with a total royalty earned of ₹{book_data.get('total_royalty_earned', 0):,.2f} "
                    f"(paid: ₹{book_data.get('royalty_paid', 0):,.2f}, pending: ₹{pending:,.2f}).\n\n"
                    f"I will gladly provide a detailed line-by-line sales and deduction breakdown from our finance team. If your payment is currently overdue, "
                    f"we will verify your linked bank transfer details and expedite this within 48 hours.\n\n"
                    f"Warm regards,\n"
                    f"BookLeaf Author Support Operations Team"
                )
        else:
            draft = (
                f"Dear {first_name},\n\n"
                f"Thank you for reaching out to BookLeaf Publishing.\n\n"
                f"We have received your query regarding \"{subject}\". For metadata and description updates to your published title, changes can be submitted "
                f"directly through your author dashboard and typically reflect on retail platforms (Amazon India, Flipkart, and the BookLeaf Store) within 3–5 business days.\n\n"
                f"If you need any adjustments or further guidance, please let us know and we will be delighted to assist.\n\n"
                f"Warm regards,\n"
                f"BookLeaf Author Support Operations Team"
            )

        tokens = int(len(draft.split()) * 1.3)
        return draft, self.model_name, tokens


def get_ai_provider() -> Tuple[BaseLLMProvider, str]:
    """
    Factory function resolving AI provider based on configuration and available API keys.
    Returns (provider_instance, provider_name).
    """
    preference = settings.AI_PROVIDER.lower()

    # 1. Gemini
    gemini_key = settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if (preference in ["gemini", "auto"]) and gemini_key:
        try:
            return GeminiProvider(api_key=gemini_key, model_name=settings.GEMINI_MODEL), "gemini"
        except Exception as e:
            logger.warning(f"Failed to initialize Gemini provider: {e}. Falling back.")

    # 2. OpenAI
    openai_key = settings.OPENAI_API_KEY or os.environ.get("OPENAI_API_KEY")
    if (preference in ["openai", "auto"]) and openai_key:
        try:
            return OpenAIProvider(api_key=openai_key, model_name=settings.OPENAI_MODEL), "openai"
        except Exception as e:
            logger.warning(f"Failed to initialize OpenAI provider: {e}. Falling back.")

    # 3. Transparent Development Mock Provider
    return DevMockProvider(), "dev-mock"
