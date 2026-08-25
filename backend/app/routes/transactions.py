from math import ceil

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_db
from app.exceptions import ApiError
from app.repositories import transactions as txn_repo
from app.schemas import (
    CategoriesOut,
    SortBy,
    SortOrder,
    TransactionListOut,
    TransactionOut,
    TransactionQuery,
    TransactionStatus,
)
from app.services.rewards import coins_earned

router = APIRouter(prefix="/transactions", tags=["transactions"])


def _to_out(row) -> TransactionOut:
    return TransactionOut(
        id=row.id,
        timestamp=row.timestamp,
        merchant=row.merchant,
        category=row.category,
        amount=row.amount,
        currency=row.currency,
        status=row.status,
        payment_method=row.payment_method,
        reward_coins=coins_earned(row.amount, row.status, get_settings().max_coins_per_transaction),
    )


@router.get(
    "",
    response_model=TransactionListOut,
    summary="List transactions",
    description="Paginated, filterable, sortable transaction list. Date filters are inclusive calendar days in Asia/Kolkata.",
)
def list_transactions(
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    search: str | None = Query(None, description="Case-insensitive merchant search"),
    category: str | None = Query(None, description="Exact category, or Uncategorized for nulls"),
    status: TransactionStatus | None = Query(None),
    min_amount: float | None = Query(None),
    max_amount: float | None = Query(None),
    from_date: str | None = Query(None, description="Inclusive start date YYYY-MM-DD (Asia/Kolkata)"),
    to_date: str | None = Query(None, description="Inclusive end date YYYY-MM-DD (Asia/Kolkata)"),
    sort_by: SortBy = Query(SortBy.timestamp),
    sort_order: SortOrder = Query(SortOrder.desc),
    db: Session = Depends(get_db),
) -> TransactionListOut:
    try:
        query = TransactionQuery(
            page=page,
            page_size=page_size,
            search=search,
            category=category,
            status=status,
            min_amount=min_amount,
            max_amount=max_amount,
            from_date=from_date or None,
            to_date=to_date or None,
            sort_by=sort_by,
            sort_order=sort_order,
        )
    except Exception as exc:
        raise ApiError(422, "INVALID_QUERY", "One or more query parameters are invalid.", extra={"details": str(exc)}) from exc

    if query.min_amount is not None and query.max_amount is not None and query.min_amount > query.max_amount:
        raise ApiError(422, "INVALID_AMOUNT_RANGE", "min_amount cannot be greater than max_amount.")
    if query.from_date and query.to_date and query.from_date > query.to_date:
        raise ApiError(422, "INVALID_DATE_RANGE", "from_date cannot be after to_date.")

    items, total = txn_repo.list_transactions(db, query)
    total_pages = ceil(total / query.page_size) if total else 0
    return TransactionListOut(
        items=[_to_out(item) for item in items],
        page=query.page,
        page_size=query.page_size,
        total=total,
        total_pages=total_pages,
    )


@router.get("/categories", response_model=CategoriesOut, summary="Distinct transaction categories")
def get_categories(db: Session = Depends(get_db)) -> CategoriesOut:
    return CategoriesOut(items=txn_repo.list_categories(db))


@router.get("/{transaction_id}", response_model=TransactionOut, summary="Get a transaction")
def get_transaction(transaction_id: str, db: Session = Depends(get_db)) -> TransactionOut:
    row = txn_repo.get_transaction(db, transaction_id)
    if row is None:
        raise ApiError(404, "TRANSACTION_NOT_FOUND", "The requested transaction does not exist.")
    return _to_out(row)
