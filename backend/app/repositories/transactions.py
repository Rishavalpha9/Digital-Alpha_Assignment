from decimal import Decimal

from sqlalchemy import Select, and_, func, select
from sqlalchemy.orm import Session

from app.models import Transaction
from app.schemas import TransactionQuery
from app.services.normalize import inclusive_date_bounds


def _escape_like(term: str) -> str:
    return term.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")


def apply_transaction_filters(stmt: Select, query: TransactionQuery) -> Select:
    conditions = []

    if query.search:
        pattern = f"%{_escape_like(query.search)}%"
        conditions.append(Transaction.merchant.ilike(pattern, escape="\\"))

    if query.category:
        if query.category.lower() == "uncategorized":
            conditions.append(Transaction.category.is_(None))
        else:
            conditions.append(Transaction.category == query.category)

    if query.status:
        conditions.append(Transaction.status == query.status.value)

    if query.min_amount is not None:
        conditions.append(Transaction.amount >= query.min_amount)

    if query.max_amount is not None:
        conditions.append(Transaction.amount <= query.max_amount)

    start, end = inclusive_date_bounds(query.from_date, query.to_date)
    if start is not None:
        conditions.append(Transaction.timestamp >= start)
    if end is not None:
        conditions.append(Transaction.timestamp < end)

    if conditions:
        stmt = stmt.where(and_(*conditions))
    return stmt


def list_transactions(db: Session, query: TransactionQuery) -> tuple[list[Transaction], int]:
    base = apply_transaction_filters(select(Transaction), query)
    total = db.scalar(select(func.count()).select_from(base.subquery())) or 0

    sort_column = Transaction.timestamp if query.sort_by.value == "timestamp" else Transaction.amount
    order = sort_column.desc() if query.sort_order.value == "desc" else sort_column.asc()
    secondary = Transaction.id.desc() if query.sort_order.value == "desc" else Transaction.id.asc()

    offset = (query.page - 1) * query.page_size
    items = db.scalars(base.order_by(order, secondary).offset(offset).limit(query.page_size)).all()
    return list(items), total


def get_transaction(db: Session, transaction_id: str) -> Transaction | None:
    return db.get(Transaction, transaction_id)


def list_categories(db: Session) -> list[str]:
    rows = db.scalars(
        select(Transaction.category)
        .where(Transaction.category.is_not(None))
        .distinct()
        .order_by(Transaction.category)
    ).all()
    return list(rows)


def category_spending(db: Session) -> list[tuple[str | None, Decimal]]:
    rows = db.execute(
        select(Transaction.category, func.coalesce(func.sum(Transaction.amount), 0))
        .where(Transaction.status == "SUCCESS", Transaction.amount > 0)
        .group_by(Transaction.category)
        .order_by(func.sum(Transaction.amount).desc())
    ).all()
    return [(row[0], Decimal(row[1])) for row in rows]


def monthly_spending(db: Session) -> list[tuple[str, Decimal]]:
    month_expr = func.to_char(func.timezone("Asia/Kolkata", Transaction.timestamp), "YYYY-MM")
    rows = db.execute(
        select(month_expr, func.coalesce(func.sum(Transaction.amount), 0))
        .where(Transaction.status == "SUCCESS", Transaction.amount > 0)
        .group_by(month_expr)
        .order_by(month_expr.asc())
    ).all()
    return [(row[0], Decimal(row[1])) for row in rows]


def spending_summary(db: Session) -> dict:
    total_transactions = db.scalar(select(func.count()).select_from(Transaction)) or 0
    successful_transactions = db.scalar(
        select(func.count()).select_from(Transaction).where(Transaction.status == "SUCCESS")
    ) or 0
    total_spend = db.scalar(
        select(func.coalesce(func.sum(Transaction.amount), 0)).where(
            Transaction.status == "SUCCESS", Transaction.amount > 0
        )
    )
    top = db.execute(
        select(Transaction.category, func.sum(Transaction.amount))
        .where(
            Transaction.status == "SUCCESS",
            Transaction.amount > 0,
            Transaction.category.is_not(None),
        )
        .group_by(Transaction.category)
        .order_by(func.sum(Transaction.amount).desc())
        .limit(1)
    ).first()
    return {
        "total_successful_spend": Decimal(total_spend or 0),
        "total_transactions": total_transactions,
        "successful_transactions": successful_transactions,
        "top_category": top[0] if top else None,
        "top_category_amount": Decimal(top[1]) if top else None,
    }
