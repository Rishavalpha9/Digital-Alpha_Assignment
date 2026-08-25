from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.repositories import transactions as txn_repo
from app.schemas import (
    CategorySpendItem,
    CategorySpendOut,
    MonthlySpendItem,
    MonthlySpendOut,
    SummaryOut,
)

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get(
    "/category-spending",
    response_model=CategorySpendOut,
    summary="Spending by category",
    description="SQL aggregation of successful, positive-amount transactions grouped by category.",
)
def category_spending(db: Session = Depends(get_db)) -> CategorySpendOut:
    items = []
    for category, amount in txn_repo.category_spending(db):
        items.append(
            CategorySpendItem(
                category=category or "Uncategorized",
                amount=amount,
            )
        )
    return CategorySpendOut(items=items)


@router.get(
    "/monthly-spending",
    response_model=MonthlySpendOut,
    summary="Monthly spending trend",
    description="SQL aggregation of successful, positive-amount transactions grouped by Asia/Kolkata month.",
)
def monthly_spending(db: Session = Depends(get_db)) -> MonthlySpendOut:
    items = [MonthlySpendItem(month=month, amount=amount) for month, amount in txn_repo.monthly_spending(db)]
    return MonthlySpendOut(items=items)


@router.get("/summary", response_model=SummaryOut, summary="Dashboard summary metrics")
def summary(db: Session = Depends(get_db)) -> SummaryOut:
    return SummaryOut(**txn_repo.spending_summary(db))
