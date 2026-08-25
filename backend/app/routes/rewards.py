from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.exceptions import ApiError
from app.repositories import rewards as reward_repo
from app.schemas import (
    BalanceOut,
    RedeemOut,
    RedeemRequest,
    RedemptionListOut,
    RedemptionOut,
    RewardOut,
)

router = APIRouter(prefix="/rewards", tags=["rewards"])


@router.get("", response_model=list[RewardOut], summary="List active rewards")
def list_rewards(db: Session = Depends(get_db)) -> list[RewardOut]:
    return [RewardOut.model_validate(row) for row in reward_repo.list_active_rewards(db)]


@router.get("/balance", response_model=BalanceOut, summary="Current reward coin balance")
def get_balance(db: Session = Depends(get_db)) -> BalanceOut:
    wallet = reward_repo.get_wallet(db)
    if wallet is None:
        raise ApiError(404, "WALLET_NOT_FOUND", "The demo wallet could not be found.")
    return BalanceOut(coin_balance=wallet.coin_balance)


@router.get("/redemptions", response_model=RedemptionListOut, summary="Redemption history")
def get_redemptions(db: Session = Depends(get_db)) -> RedemptionListOut:
    items = []
    for row in reward_repo.list_redemptions(db):
        items.append(
            RedemptionOut(
                id=row.id,
                reward_id=row.reward_id,
                reward_name=row.reward.name if row.reward else "Unknown reward",
                coins_spent=row.coins_spent,
                status=row.status,
                created_at=row.created_at,
            )
        )
    return RedemptionListOut(items=items)


@router.post(
    "/redeem",
    response_model=RedeemOut,
    summary="Redeem a reward",
    description="Atomically locks the demo wallet, rejects unaffordable redemptions, and records history.",
    responses={
        400: {
            "description": "Insufficient balance or inactive reward",
            "content": {
                "application/json": {
                    "example": {
                        "error": "INSUFFICIENT_BALANCE",
                        "message": "You do not have enough coins for this reward.",
                        "required": 2500,
                        "available": 1200,
                    }
                }
            },
        },
        404: {
            "description": "Reward not found",
            "content": {
                "application/json": {
                    "example": {
                        "error": "REWARD_NOT_FOUND",
                        "message": "The requested reward does not exist.",
                    }
                }
            },
        },
    },
)
def redeem(payload: RedeemRequest, db: Session = Depends(get_db)) -> RedeemOut:
    result = reward_repo.redeem_reward(db, payload.reward_id)
    return RedeemOut(**result)
