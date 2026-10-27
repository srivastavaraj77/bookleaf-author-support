"""
Idempotent Database Seeding Script for BookLeaf Publishing.
Loads the exact 10 authors and 18 books from bookleaf_sample_data.json,
creates secure user accounts with bcrypt hashed passwords, and seeds initial demo tickets.
"""

import json
import os
import sys
from datetime import datetime, timezone, timedelta

# Ensure app package is in path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal, engine, Base
from app.core.security import hash_password
from app.models.models import User, Author, Book, Ticket, TicketMessage, InternalNote, AIDraft
from app.services.ai.service import AIService

DEFAULT_AUTHOR_PASSWORD = "AuthorPassword123!"
DEFAULT_ADMIN_PASSWORD = "AdminPassword123!"


def seed_database():
    print("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Seed or update Admin User
        admin_email = "admin@bookleafpub.com"
        admin_user = db.query(User).filter(User.email == admin_email).first()
        if not admin_user:
            admin_user = User(
                email=admin_email,
                hashed_password=hash_password(DEFAULT_ADMIN_PASSWORD),
                full_name="BookLeaf Support Operations Lead",
                role="admin",
                is_active=True,
            )
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)
            print(f" Created default admin account: {admin_email} (password: {DEFAULT_ADMIN_PASSWORD})")
        else:
            print(f"✓ Default admin account exists: {admin_email}")

        # 2. Load JSON Sample Data
        json_path = os.path.join(os.path.dirname(__file__), "data", "bookleaf_sample_data.json")
        if not os.path.exists(json_path):
            raise FileNotFoundError(f"Sample data JSON not found at {json_path}")

        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        authors_list = data.get("authors", [])
        print(f"Found {len(authors_list)} authors in sample data.")

        total_books_seeded = 0

        for author_raw in authors_list:
            author_id = author_raw["author_id"]
            email = author_raw["email"].lower().strip()
            name = author_raw["name"]

            # Ensure user account for author
            user = db.query(User).filter(User.email == email).first()
            if not user:
                user = User(
                    email=email,
                    hashed_password=hash_password(DEFAULT_AUTHOR_PASSWORD),
                    full_name=name,
                    role="author",
                    is_active=True
                )
                db.add(user)
                db.commit()
                db.refresh(user)

            # Ensure Author profile
            author = db.query(Author).filter(Author.author_id == author_id).first()
            if not author:
                author = Author(
                    author_id=author_id,
                    user_id=user.id,
                    name=name,
                    email=email,
                    phone=author_raw.get("phone"),
                    city=author_raw.get("city"),
                    joined_date=author_raw.get("joined_date")
                )
                db.add(author)
                db.commit()
                db.refresh(author)
            else:
                # Update attributes
                author.user_id = user.id
                author.phone = author_raw.get("phone")
                author.city = author_raw.get("city")
                author.joined_date = author_raw.get("joined_date")
                db.commit()

            # Seed Books
            for book_raw in author_raw.get("books", []):
                book_id = book_raw["book_id"]
                book = db.query(Book).filter(Book.book_id == book_id).first()
                if not book:
                    book = Book(
                        book_id=book_id,
                        author_id=author_id,
                        title=book_raw["title"],
                        isbn=book_raw.get("isbn"),
                        genre=book_raw.get("genre"),
                        publication_date=book_raw.get("publication_date"),
                        status=book_raw["status"],
                        mrp=float(book_raw["mrp"]) if book_raw.get("mrp") is not None else None,
                        author_royalty_per_copy=float(book_raw["author_royalty_per_copy"]) if book_raw.get("author_royalty_per_copy") is not None else None,
                        total_copies_sold=int(book_raw.get("total_copies_sold", 0)),
                        total_royalty_earned=float(book_raw.get("total_royalty_earned", 0.0)),
                        royalty_paid=float(book_raw.get("royalty_paid", 0.0)),
                        royalty_pending=float(book_raw.get("royalty_pending", 0.0)),
                        last_royalty_payout_date=book_raw.get("last_royalty_payout_date"),
                        print_partner=book_raw.get("print_partner"),
                        available_on=book_raw.get("available_on", [])
                    )
                    db.add(book)
                    total_books_seeded += 1
                else:
                    # Refresh fields
                    book.title = book_raw["title"]
                    book.isbn = book_raw.get("isbn")
                    book.genre = book_raw.get("genre")
                    book.publication_date = book_raw.get("publication_date")
                    book.status = book_raw["status"]
                    book.mrp = float(book_raw["mrp"]) if book_raw.get("mrp") is not None else None
                    book.author_royalty_per_copy = float(book_raw["author_royalty_per_copy"]) if book_raw.get("author_royalty_per_copy") is not None else None
                    book.total_copies_sold = int(book_raw.get("total_copies_sold", 0))
                    book.total_royalty_earned = float(book_raw.get("total_royalty_earned", 0.0))
                    book.royalty_paid = float(book_raw.get("royalty_paid", 0.0))
                    book.royalty_pending = float(book_raw.get("royalty_pending", 0.0))
                    book.last_royalty_payout_date = book_raw.get("last_royalty_payout_date")
                    book.print_partner = book_raw.get("print_partner")
                    book.available_on = book_raw.get("available_on", [])

        db.commit()
        print(f"✓ Seeded {len(authors_list)} authors and verified {total_books_seeded} books.")

        # 3. Seed Realistic Initial Tickets if none exist
        existing_tickets = db.query(Ticket).count()
        if existing_tickets == 0:
            print("Seeding initial support tickets to illustrate queue workflows...")
            now = datetime.now(timezone.utc)

            sample_tickets_data = [
                {
                    "author_id": "AUTH001",
                    "book_id": "BK001",
                    "subject": "Missing Q3 royalty payout for Whispers of the Ganges",
                    "description": "I noticed ₹3,570 in pending royalties on my dashboard from the October cycle. Has this payment been initiated to my HDFC account yet?",
                    "status": "In Progress",
                    "hours_ago": 18,
                },
                {
                    "author_id": "AUTH007",
                    "book_id": "BK011",
                    "subject": "Amazon India showing different ISBN than my physical copy",
                    "description": "My readers are reporting that the paperback listed on Amazon displays a different ISBN barcode than what was printed on my author copies. Can you please check?",
                    "status": "Open",
                    "hours_ago": 26,
                },
                {
                    "author_id": "AUTH004",
                    "book_id": "BK006",
                    "subject": "Author copies received with misaligned spine cut",
                    "description": "I received my box of 25 copies today for Debugging Life, but the spine text is badly shifted to the back cover. The pages are misaligned.",
                    "status": "Open",
                    "hours_ago": 4,
                },
                {
                    "author_id": "AUTH009",
                    "book_id": "BK015",
                    "subject": "Typesetting timeline inquiry for Raising Roots",
                    "description": "My book has been in Typesetting for about 3 weeks now. Could you let me know when the PDF proofs will be ready for my proofreading review?",
                    "status": "Open",
                    "hours_ago": 72,
                },
                {
                    "author_id": "AUTH002",
                    "book_id": "BK004",
                    "subject": "Stock showing Currently Unavailable on Amazon US",
                    "description": "Startup Sutra is showing Out of Stock on Amazon US even though it was previously live. Could we trigger a stock sync?",
                    "status": "Resolved",
                    "hours_ago": 96,
                }
            ]

            for idx, item in enumerate(sample_tickets_data, start=1):
                ticket_number = f"TICK-{now.year}-{1000 + idx}"
                created_at = now - timedelta(hours=item["hours_ago"])

                # Run classification
                classification, provider_name, status = AIService.classify_and_prioritize_ticket(
                    subject=item["subject"],
                    description=item["description"]
                )

                t = Ticket(
                    ticket_number=ticket_number,
                    author_id=item["author_id"],
                    book_id=item["book_id"],
                    subject=item["subject"],
                    description=item["description"],
                    category=classification.category,
                    priority=classification.priority,
                    status=item["status"],
                    ai_category=classification.category,
                    ai_priority=classification.priority,
                    ai_confidence=classification.confidence,
                    ai_reasoning=classification.reasoning,
                    ai_processing_status=status,
                    ai_provider=provider_name,
                    created_at=created_at,
                    updated_at=created_at,
                )
                db.add(t)
                db.commit()
                db.refresh(t)

                # Author initial query message
                author_obj = db.query(Author).filter(Author.author_id == item["author_id"]).first()
                msg = TicketMessage(
                    ticket_id=t.id,
                    sender_role="author",
                    sender_name=author_obj.name,
                    sender_email=author_obj.email,
                    message=item["description"],
                    created_at=created_at
                )
                db.add(msg)

                # Generate AI draft
                AIService.generate_draft_response(db, t)

                # If in progress or resolved, add admin notes/replies
                if item["status"] in ["In Progress", "Resolved"]:
                    note = InternalNote(
                        ticket_id=t.id,
                        admin_id=admin_user.id,
                        admin_name=admin_user.full_name,
                        note="Verified with logistics/finance team. Payout and sync batch pending review.",
                        created_at=created_at + timedelta(hours=2)
                    )
                    db.add(note)

                if item["status"] == "Resolved":
                    admin_reply = TicketMessage(
                        ticket_id=t.id,
                        sender_role="admin",
                        sender_name=admin_user.full_name,
                        sender_email=admin_user.email,
                        message="We have triggered an electronic stock re-sync with Amazon US. The listing is now back live and available for customer ordering.",
                        created_at=created_at + timedelta(hours=12)
                    )
                    db.add(admin_reply)

                db.commit()

            print(f"✓ Pre-seeded {len(sample_tickets_data)} realistic tickets with AI drafts and history.")
        else:
            print(f"✓ Found {existing_tickets} existing tickets in database.")

        print("\n Seeding completed successfully!")
        print("\n--- TEST CREDENTIALS ---")
        print(f"Admin Portal:  email: {admin_email} | password: {DEFAULT_ADMIN_PASSWORD}")
        print(f"Author Portal: email: priya.sharma@email.com | password: {DEFAULT_AUTHOR_PASSWORD}")
        print(f"               (or any of the other 9 authors with the same password: {DEFAULT_AUTHOR_PASSWORD})")
        print("------------------------\n")

    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
