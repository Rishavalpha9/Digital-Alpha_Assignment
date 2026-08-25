from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import NullPool

from app.config import get_settings
from app.database import Base, get_db
from app.main import app
from app.models import Reward, Transaction, Wallet
from decimal import Decimal

TEST_DATABASE_URL = "postgresql+psycopg://finance:finance@localhost:5432/finance_test"


def _ensure_test_database() -> None:
    admin = create_engine(
        "postgresql+psycopg://finance:finance@localhost:5432/postgres",
        isolation_level="AUTOCOMMIT",
        poolclass=NullPool,
    )
    with admin.connect() as conn:
        exists = conn.execute(text("SELECT 1 FROM pg_database WHERE datname = 'finance_test'")).scalar()
        if not exists:
            conn.execute(text("CREATE DATABASE finance_test"))
    admin.dispose()


_ensure_test_database()
engine = create_engine(TEST_DATABASE_URL, poolclass=NullPool)
TestingSession = sessionmaker(bind=engine, autoflush=False, autocommit=False, expire_on_commit=False)


@pytest.fixture(autouse=True)
def setup_database() -> Generator[None, None, None]:
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    yield
    Base.metadata.drop_all(engine)


@pytest.fixture
def db() -> Generator[Session, None, None]:
    session = TestingSession()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def client(db: Session) -> Generator[TestClient, None, None]:
    def override_get_db() -> Generator[Session, None, None]:
        yield db

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


def seed_core(db: Session) -> None:
    db.add_all(
        [
            Transaction(
                id="TXN1",
                timestamp="2025-10-03T21:03:27+00:00",
                merchant="Amazon",
                category="Shopping",
                amount=Decimal("1200.00"),
                currency="INR",
                status="SUCCESS",
                payment_method="UPI",
            ),
            Transaction(
                id="TXN2",
                timestamp="2025-11-03T10:00:00+00:00",
                merchant="Swiggy",
                category="Food & Dining",
                amount=Decimal("500.00"),
                currency="INR",
                status="FAILED",
                payment_method="Credit Card",
            ),
            Transaction(
                id="TXN3",
                timestamp="2025-12-01T08:00:00+00:00",
                merchant="Cult.fit",
                category=None,
                amount=Decimal("900.00"),
                currency="INR",
                status="SUCCESS",
                payment_method="Netbanking",
            ),
        ]
    )
    db.add_all(
        [
            Reward(name="Coffee", description="Test reward", coin_cost=100, reward_type="VOUCHER", active=True),
            Reward(name="Yacht", description="Too expensive", coin_cost=5000, reward_type="TRAVEL", active=True),
            Reward(name="Retired", description="Gone", coin_cost=10, reward_type="VOUCHER", active=False),
        ]
    )
    db.add(Wallet(id=get_settings().demo_wallet_id, coin_balance=1000))
    db.commit()
