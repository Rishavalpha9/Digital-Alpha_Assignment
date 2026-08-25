from decimal import Decimal

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.config import get_settings
from app.models import Redemption, Reward, Wallet
from app.services.rewards import coins_earned
from tests.conftest import seed_core


def test_list_transactions_and_filters(client: TestClient, db: Session) -> None:
    seed_core(db)
    response = client.get("/api/transactions?page=1&page_size=25")
    assert response.status_code == 200
    body = response.json()
    assert body["total"] == 3
    assert len(body["items"]) == 3

    search = client.get("/api/transactions?search=amazon")
    assert search.json()["total"] == 1
    assert search.json()["items"][0]["merchant"] == "Amazon"

    category = client.get("/api/transactions?category=Uncategorized")
    assert category.json()["total"] == 1
    assert category.json()["items"][0]["id"] == "TXN3"

    status = client.get("/api/transactions?status=SUCCESS")
    assert status.json()["total"] == 2

    amount = client.get("/api/transactions?min_amount=1000&max_amount=2000")
    assert amount.json()["total"] == 1

    combined = client.get(
        "/api/transactions?search=amazon&status=SUCCESS&category=Shopping&min_amount=1000&max_amount=2000"
    )
    assert combined.json()["total"] == 1

    sorted_amount = client.get("/api/transactions?sort_by=amount&sort_order=desc")
    assert [item["id"] for item in sorted_amount.json()["items"]] == ["TXN1", "TXN3", "TXN2"]


def test_transaction_detail_not_found(client: TestClient, db: Session) -> None:
    seed_core(db)
    missing = client.get("/api/transactions/NOPE")
    assert missing.status_code == 404
    found = client.get("/api/transactions/TXN1")
    assert found.status_code == 200
    assert found.json()["reward_coins"] == coins_earned(Decimal("1200.00"), "SUCCESS", 50)


def test_analytics(client: TestClient, db: Session) -> None:
    seed_core(db)
    category = client.get("/api/analytics/category-spending")
    assert category.status_code == 200
    names = {item["category"] for item in category.json()["items"]}
    assert "Shopping" in names
    assert "Food & Dining" not in names
    monthly = client.get("/api/analytics/monthly-spending")
    assert monthly.status_code == 200
    assert monthly.json()["items"]


def test_successful_redemption(client: TestClient, db: Session) -> None:
    seed_core(db)
    reward = db.query(Reward).filter(Reward.name == "Coffee").one()
    response = client.post("/api/rewards/redeem", json={"reward_id": reward.id})
    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert body["coins_spent"] == 100
    assert body["remaining_balance"] == 900
    db.expire_all()
    wallet = db.get(Wallet, get_settings().demo_wallet_id)
    assert wallet is not None
    assert wallet.coin_balance == 900
    assert db.query(Redemption).count() == 1


def test_nonexistent_reward(client: TestClient, db: Session) -> None:
    seed_core(db)
    response = client.post("/api/rewards/redeem", json={"reward_id": 99999})
    assert response.status_code == 404
    assert response.json()["error"] == "REWARD_NOT_FOUND"
    wallet = db.get(Wallet, get_settings().demo_wallet_id)
    assert wallet is not None
    assert wallet.coin_balance == 1000
    assert db.query(Redemption).count() == 0


def test_insufficient_balance(client: TestClient, db: Session) -> None:
    seed_core(db)
    reward = db.query(Reward).filter(Reward.name == "Yacht").one()
    response = client.post("/api/rewards/redeem", json={"reward_id": reward.id})
    assert response.status_code == 400
    body = response.json()
    assert body["error"] == "INSUFFICIENT_BALANCE"
    assert body["required"] == 5000
    assert body["available"] == 1000
    wallet = db.get(Wallet, get_settings().demo_wallet_id)
    assert wallet is not None
    assert wallet.coin_balance == 1000
    assert db.query(Redemption).count() == 0


def test_balance_cannot_become_negative(client: TestClient, db: Session) -> None:
    seed_core(db)
    wallet = db.get(Wallet, get_settings().demo_wallet_id)
    assert wallet is not None
    wallet.coin_balance = 50
    db.commit()
    reward = db.query(Reward).filter(Reward.name == "Coffee").one()
    response = client.post("/api/rewards/redeem", json={"reward_id": reward.id})
    assert response.status_code == 400
    db.refresh(wallet)
    assert wallet.coin_balance == 50
    assert db.query(Redemption).count() == 0
