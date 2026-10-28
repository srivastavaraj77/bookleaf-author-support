import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from app.core.security import hash_password, create_access_token
from app.main import app
from app.models.models import User, Author, Book, Ticket, TicketMessage, InternalNote

# In-memory SQLite for testing
TEST_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        # Seed test admin
        admin = User(
            id=1,
            email="admin@test.com",
            hashed_password=hash_password("AdminPass123!"),
            full_name="Test Admin Lead",
            role="admin",
            is_active=True,
        )
        session.add(admin)

        # Seed Author 1
        user_auth1 = User(
            id=2,
            email="author1@test.com",
            hashed_password=hash_password("AuthorPass123!"),
            full_name="Priya Sharma",
            role="author",
            is_active=True,
        )
        session.add(user_auth1)
        author1 = Author(
            id=1,
            author_id="AUTH001",
            user_id=2,
            name="Priya Sharma",
            email="author1@test.com",
            phone="+91-98765-43210",
            city="Mumbai",
            joined_date="2023-03-15",
        )
        session.add(author1)

        # Seed Author 2
        user_auth2 = User(
            id=3,
            email="author2@test.com",
            hashed_password=hash_password("AuthorPass123!"),
            full_name="Rohit Kapoor",
            role="author",
            is_active=True,
        )
        session.add(user_auth2)
        author2 = Author(
            id=2,
            author_id="AUTH002",
            user_id=3,
            name="Rohit Kapoor",
            email="author2@test.com",
            phone="+91-87654-32109",
            city="Delhi",
            joined_date="2022-11-08",
        )
        session.add(author2)

        # Seed Books
        bk1 = Book(
            id=1,
            book_id="BK001",
            author_id="AUTH001",
            title="Whispers of the Ganges",
            isbn="978-93-5XXXX-01-1",
            genre="Literary Fiction",
            publication_date="2023-06-20",
            status="Published & Live",
            mrp=399.0,
            author_royalty_per_copy=35.0,
            total_copies_sold=342,
            total_royalty_earned=11970.0,
            royalty_paid=8400.0,
            royalty_pending=3570.0,
            last_royalty_payout_date="2025-10-15",
            print_partner="In-House",
            available_on=["Amazon India", "Flipkart", "BookLeaf Store"]
        )
        bk2 = Book(
            id=2,
            book_id="BK003",
            author_id="AUTH002",
            title="Code & Karma",
            isbn="978-93-5XXXX-03-5",
            genre="Self-Help / Technology",
            publication_date="2023-02-14",
            status="Published & Live",
            mrp=350.0,
            author_royalty_per_copy=30.0,
            total_copies_sold=876,
            total_royalty_earned=26280.0,
            royalty_paid=21000.0,
            royalty_pending=5280.0,
            last_royalty_payout_date="2025-09-01",
            print_partner="Repro India",
            available_on=["Amazon India", "Flipkart", "BookLeaf Store"]
        )
        session.add_all([bk1, bk2])
        session.commit()

        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def admin_headers():
    token = create_access_token(subject=1, role="admin", name="Test Admin")
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def author1_headers():
    token = create_access_token(subject=2, role="author", author_id="AUTH001", name="Priya Sharma")
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def author2_headers():
    token = create_access_token(subject=3, role="author", author_id="AUTH002", name="Rohit Kapoor")
    return {"Authorization": f"Bearer {token}"}

