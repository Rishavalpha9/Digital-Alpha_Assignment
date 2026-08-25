from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.config import get_settings
from app.exceptions import ApiError
from app.models import Redemption, Reward, Wallet


def list_active_rewards(db: Session) -> list[Reward]:
    return list(db.scalars(select(Reward).where(Reward.active.is_(True)).order_by(Reward.coin_cost.asc())).all())


def get_wallet(db: Session, wallet_id: int | None = None) -> Wallet | None:
    return db.get(Wallet, wallet_id or get_settings().demo_wallet_id)


def list_redemptions(db: Session) -> list[Redemption]:
    return list(
        db.scalars(
            select(Redemption)
            .options(selectinload(Redemption.reward))
            .order_by(Redemption.created_at.desc(), Redemption.id.desc())
        ).all()
    )


def redeem_reward(db: Session, reward_id: int, wallet_id: int | None = None) -> dict:
    settings = get_settings()
    target_wallet_id = wallet_id or settings.demo_wallet_id

    reward = db.get(Reward, reward_id)
    if reward is None:
        raise ApiError(404, "REWARD_NOT_FOUND", "The requested reward does not exist.")
    if not reward.active:
        raise ApiError(400, "REWARD_INACTIVE", "This reward is no longer available.")

    wallet = db.execute(
        select(Wallet).where(Wallet.id == target_wallet_id).with_for_update()
    ).scalar_one_or_none()
    if wallet is None:
        raise ApiError(404, "WALLET_NOT_FOUND", "The demo wallet could not be found.")

    if wallet.coin_balance < reward.coin_cost:
        raise ApiError(
            400,
            "INSUFFICIENT_BALANCE",
            "You do not have enough coins for this reward.",
            extra={"required": reward.coin_cost, "available": wallet.coin_balance},
        )

    wallet.coin_balance -= reward.coin_cost
    wallet.updated_at = datetime.now(timezone.utc)
    redemption = Redemption(
        reward_id=reward.id,
        coins_spent=reward.coin_cost,
        status="COMPLETED",
    )
    db.add(redemption)
    db.commit()
    db.refresh(redemption)
    db.refresh(wallet)

    return {
        "success": True,
        "message": "Reward redeemed successfully",
        "redemption_id": redemption.id,
        "coins_spent": redemption.coins_spent,
        "remaining_balance": wallet.coin_balance,
    }
