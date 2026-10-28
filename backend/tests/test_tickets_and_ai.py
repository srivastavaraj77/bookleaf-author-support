def test_author_create_ticket_with_ai_classification(client, author1_headers):
    payload = {
        "book_id": "BK001",
        "subject": "Missing Q3 royalty payout for Whispers of the Ganges",
        "description": "I have ₹3,570 in pending royalties but haven't received payment in my bank account for over 2 months."
    }
    response = client.post("/api/v1/tickets", json=payload, headers=author1_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["ticket_number"].startswith("TICK-")
    assert data["author_id"] == "AUTH001"
    assert data["category"] == "Royalty & Payments"
    assert data["priority"] in ["High", "Critical"]
    assert data["status"] == "Open"
    assert data["ai_processing_status"] in ["success", "fallback"]


def test_author_create_ticket_general_account_level(client, author1_headers):
    payload = {
        "book_id": None,
        "subject": "Question about updating author bio and bank details",
        "description": "Where in the portal can I update my primary bank account details for upcoming payouts?"
    }
    response = client.post("/api/v1/tickets", json=payload, headers=author1_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["book_id"] is None
    assert data["book_title"] == "General / Account Level"
    assert data["category"] in ["Royalty & Payments", "General Inquiry"]


def test_admin_internal_notes_hidden_from_author(client, author1_headers, admin_headers):
    # 1. Author creates ticket
    t_resp = client.post("/api/v1/tickets", json={
        "book_id": "BK001",
        "subject": "Printing defect on author copies",
        "description": "The cover colors look washed out and the binding glue is coming apart."
    }, headers=author1_headers)
    ticket_id = t_resp.json()["id"]

    # 2. Admin adds a private internal note
    note_resp = client.post(f"/api/v1/admin/tickets/{ticket_id}/notes", json={
        "note": "CONFIDENTIAL: Internal Delhi press calibration error. Repro India print run scheduled."
    }, headers=admin_headers)
    assert note_resp.status_code == 200

    # 3. Admin views ticket detail -> internal note IS present
    admin_detail = client.get(f"/api/v1/admin/tickets/{ticket_id}", headers=admin_headers).json()
    assert len(admin_detail["internal_notes"]) == 1
    assert "CONFIDENTIAL" in admin_detail["internal_notes"][0]["note"]

    # 4. Author views ticket detail -> internal note is NOT serialized or exposed
    author_detail = client.get(f"/api/v1/tickets/{ticket_id}", headers=author1_headers).json()
    assert "internal_notes" not in author_detail


def test_admin_override_classification_and_reply(client, author1_headers, admin_headers):
    # 1. Create ticket
    t_resp = client.post("/api/v1/tickets", json={
        "book_id": "BK001",
        "subject": "Listing is showing wrong ISBN on retail portal",
        "description": "My readers are seeing the wrong edition listed."
    }, headers=author1_headers).json()
    ticket_id = t_resp["id"]

    # 2. Admin overrides priority to Critical
    override_resp = client.patch(f"/api/v1/admin/tickets/{ticket_id}/override", json={
        "category": "ISBN & Metadata Issues",
        "priority": "Critical"
    }, headers=admin_headers)
    assert override_resp.status_code == 200
    assert override_resp.json()["priority"] == "Critical"
    # Original AI priority is preserved
    assert override_resp.json()["ai_priority"] is not None

    # 3. Admin sends official reply
    reply_resp = client.post(f"/api/v1/admin/tickets/{ticket_id}/reply", json={
        "message": "We have escalated this to our senior production team with a 48-hour resolution window.",
        "status_change": "In Progress"
    }, headers=admin_headers)
    assert reply_resp.status_code == 200
    assert reply_resp.json()["ticket_status"] == "In Progress"

    # 4. Author checks ticket -> sees admin reply
    auth_view = client.get(f"/api/v1/tickets/{ticket_id}", headers=author1_headers).json()
    assert auth_view["status"] == "In Progress"
    assert len(auth_view["messages"]) >= 2
    assert any(m["sender_role"] == "admin" for m in auth_view["messages"])

