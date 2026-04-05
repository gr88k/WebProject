import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app, Base, get_db

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False}  # Нужно для SQLite
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()

@pytest.fixture
def test_user(db):
    from app.main import User, hash_password
    user = User(
        email="test@example.com",
        name="Test User",
        hashed_password=hash_password("password123"),
        role="user",
        class_name="10-Б"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@pytest.fixture
def test_moderator(db):
    from app.main import User, hash_password
    user = User(
        email="mod@example.com",
        name="Moderator",
        hashed_password=hash_password("password123"),
        role="moderator",
        class_name="11-А"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@pytest.fixture
def test_admin(db):
    from app.main import User, hash_password
    user = User(
        email="admin@example.com",
        name="Admin",
        hashed_password=hash_password("password123"),
        role="admin",
        class_name="11-А"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user