def test_login_success_author(client):
    response = client.post("/api/v1/auth/login", json={
        "email": "author1@test.com",
        "password": "AuthorPass123!"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["role"] == "author"
    assert data["author_id"] == "AUTH001"
    assert data["name"] == "Priya Sharma"


def test_login_success_admin(client):
    response = client.post("/api/v1/auth/login", json={
        "email": "admin@test.com",
        "password": "AdminPass123!"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["role"] == "admin"


def test_login_invalid_password(client):
    response = client.post("/api/v1/auth/login", json={
        "email": "author1@test.com",
        "password": "WrongPassword!"
    })
    assert response.status_code == 401
    assert "Incorrect email or password" in response.json()["detail"]


def test_author_cannot_access_admin_dashboard(client, author1_headers):
    # Role-based protection: Author must receive 403 Forbidden on admin routes
    response = client.get("/api/v1/admin/dashboard", headers=author1_headers)
    assert response.status_code == 403


def test_admin_can_access_admin_dashboard(client, admin_headers):
    response = client.get("/api/v1/admin/dashboard", headers=admin_headers)
    assert response.status_code == 200
    data = response.json()
    assert "total_tickets" in data
    assert "category_volume" in data


def test_cross_author_book_access_forbidden(client, author1_headers, author2_headers):
    # Author 1 owns BK001, Author 2 owns BK003
    # Author 1 accessing their own book succeeds:
    resp1 = client.get("/api/v1/books/BK001", headers=author1_headers)
    assert resp1.status_code == 200
    assert resp1.json()["title"] == "Whispers of the Ganges"

    # Author 1 attempting to view Author 2's book (BK003) must be rejected with 403 Forbidden:
    resp2 = client.get("/api/v1/books/BK003", headers=author1_headers)
    assert resp2.status_code == 403
    assert "authorization" in resp2.json()["detail"].lower()
