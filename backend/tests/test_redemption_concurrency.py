from concurrent.futures import ThreadPoolExecutor

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_db
from app.main import app
from app.models import Redemption, Reward, Wallet
from tests.conftest import TestingSession, seed_core


def test_concurrent_redemption_spends_coins_once(db: Session) -> None:
    seed_core(db)
    wallet = db.get(Wallet, get_settings().demo_wallet_id)
    assert wallet is not None
    wallet.coin_balance = 100
    db.commit()
    reward = db.query(Reward).filter(Reward.name == "Coffee").one()

    def override_get_db():
        session = TestingSession()
        try:
            yield session
        finally:
            session.close()

    app.dependency_overrides[get_db] = override_get_db
    try:
        with TestClient(app) as test_client:
            def redeem() -> int:
                return test_client.post("/api/rewards/redeem", json={"reward_id": reward.id}).status_code

            with ThreadPoolExecutor(max_workers=2) as pool:
                results = list(pool.map(lambda _: redeem(), range(2)))
    finally:
        app.dependency_overrides.clear()

    assert sorted(results) == [200, 400]
    check = TestingSession()
    try:
        final_wallet = check.get(Wallet, get_settings().demo_wallet_id)
        assert final_wallet is not None
        assert final_wallet.coin_balance == 0
        assert check.query(Redemption).count() == 1
    finally:
        check.close()
