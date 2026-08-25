from decimal import Decimal

from app.config import get_settings


def coins_earned(amount: Decimal, status: str, cap: int | None = None) -> int:
    """Award 1 coin per ₹100 spent on successful payments, with a per-transaction cap.

    Negative and non-success transactions earn zero coins.
    """
    if status != "SUCCESS":
        return 0
    if amount <= 0:
        return 0
    limit = cap if cap is not None else get_settings().max_coins_per_transaction
    return min(int(amount // 100), limit)
