import io
from app.services.ai.knowledge_base import get_relevant_policies, ROYALTY_POLICY, ISBN_POLICY, PRINTING_AND_QUALITY_POLICY


def test_author_dashboard_metrics(client, author1_headers):
    response = client.get("/api/v1/authors/me/dashboard", headers=author1_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["author_id"] == "AUTH001"
    assert data["total_books"] == 1  # BK001 seeded in fixture
    assert data["published_books"] == 1
    assert data["books_in_production"] == 0
    assert data["total_copies_sold"] == 342
    assert data["total_royalty_earned"] == 11970.0
    assert data["royalty_paid"] == 8400.0
    assert data["royalty_pending"] == 3570.0


def test_author_books_list_and_search(client, author1_headers):
    # Get all books
    resp = client.get("/api/v1/books", headers=author1_headers)
    assert resp.status_code == 200
    books = resp.json()
    assert len(books) == 1
    assert books[0]["book_id"] == "BK001"
    assert books[0]["mrp"] == 399.0
    assert "Amazon India" in books[0]["available_on"]

    # Search by title match
    resp_search = client.get("/api/v1/books?search=Ganges", headers=author1_headers)
    assert len(resp_search.json()) == 1

    # Search with no match
    resp_nomatch = client.get("/api/v1/books?search=NonExistentBookXYZ", headers=author1_headers)
    assert len(resp_nomatch.json()) == 0


def test_knowledge_base_token_conscious_retrieval():
    # Royalty query should retrieve royalty policy
    royalty_ctx = get_relevant_policies("Royalty & Payments", "Where is my quarterly payout?")
    assert "80/20 split" in royalty_ctx
    assert "₹1,000" in royalty_ctx

    # ISBN query should retrieve ISBN policy
    isbn_ctx = get_relevant_policies("ISBN & Metadata Issues", "Duplicate ISBN reported on Amazon")
    assert "publisher imprint" in isbn_ctx
    assert "HIGH-PRIORITY" in isbn_ctx

    # Print defect query should retrieve printing policy
    print_ctx = get_relevant_policies("Printing & Quality", "The pages are misaligned and blurry")
    assert "free reprint" in print_ctx
    assert "5–7 business days" in print_ctx



def test_file_upload_validation(client, author1_headers):
    # Valid image upload
    file_content = b"fake-image-bytes"
    file = io.BytesIO(file_content)
    response = client.post(
        "/api/v1/tickets/upload",
        files={"file": ("sample_defect.png", file, "image/png")},
        headers=author1_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["filename"] == "sample_defect.png"
    assert "file_url" in data

    # Disallowed file extension (.exe)
    bad_file = io.BytesIO(b"executable-bytes")
    resp_bad = client.post(
        "/api/v1/tickets/upload",
        files={"file": ("malicious.exe", bad_file, "application/octet-stream")},
        headers=author1_headers
    )
    assert resp_bad.status_code == 400
    assert "Unsupported file format" in resp_bad.json()["detail"]
