from datetime import date, datetime
from decimal import Decimal
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field, field_validator


class SortBy(str, Enum):
    timestamp = "timestamp"
    amount = "amount"


class SortOrder(str, Enum):
    asc = "asc"
    desc = "desc"


class TransactionStatus(str, Enum):
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"
    PENDING = "PENDING"


class TransactionQuery(BaseModel):
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=25, ge=1, le=100)
    search: str | None = Field(default=None, max_length=128)
    category: str | None = Field(default=None, max_length=128)
    status: TransactionStatus | None = None
    min_amount: Decimal | None = None
    max_amount: Decimal | None = None
    from_date: date | None = None
    to_date: date | None = None
    sort_by: SortBy = SortBy.timestamp
    sort_order: SortOrder = SortOrder.desc

    @field_validator("search")
    @classmethod
    def strip_search(cls, value: str | None) -> str | None:
        if value is None:
            return None
        cleaned = value.strip()
        return cleaned or None

    @field_validator("category")
    @classmethod
    def strip_category(cls, value: str | None) -> str | None:
        if value is None:
            return None
        cleaned = value.strip()
        return cleaned or None


class TransactionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    timestamp: datetime
    merchant: str
    category: str | None
    amount: Decimal
    currency: str
    status: str
    payment_method: str
    reward_coins: int = 0


class TransactionListOut(BaseModel):
    items: list[TransactionOut]
    page: int
    page_size: int
    total: int
    total_pages: int


class CategorySpendItem(BaseModel):
    category: str
    amount: Decimal


class CategorySpendOut(BaseModel):
    items: list[CategorySpendItem]


class MonthlySpendItem(BaseModel):
    month: str
    amount: Decimal


class MonthlySpendOut(BaseModel):
    items: list[MonthlySpendItem]


class SummaryOut(BaseModel):
    total_successful_spend: Decimal
    total_transactions: int
    successful_transactions: int
    top_category: str | None
    top_category_amount: Decimal | None


class CategoriesOut(BaseModel):
    items: list[str]


class RewardOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: str
    coin_cost: int
    reward_type: str
    active: bool


class BalanceOut(BaseModel):
    coin_balance: int


class RedeemRequest(BaseModel):
    reward_id: int = Field(ge=1)


class RedeemOut(BaseModel):
    success: bool
    message: str
    redemption_id: int
    coins_spent: int
    remaining_balance: int


class RedemptionOut(BaseModel):
    id: int
    reward_id: int
    reward_name: str
    coins_spent: int
    status: str
    created_at: datetime


class RedemptionListOut(BaseModel):
    items: list[RedemptionOut]
