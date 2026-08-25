from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, Integer, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Wallet(Base):
    __tablename__ = "wallet"
    __table_args__ = (
        CheckConstraint("coin_balance >= 0", name="ck_wallet_balance_nonneg"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    coin_balance: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )
