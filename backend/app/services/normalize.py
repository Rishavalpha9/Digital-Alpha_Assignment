from datetime import date, datetime, time, timedelta, timezone
from decimal import Decimal, InvalidOperation
from typing import Any
from zoneinfo import ZoneInfo

IST = ZoneInfo("Asia/Kolkata")
ALLOWED_STATUSES = {"SUCCESS", "FAILED", "PENDING"}
ALLOWED_CURRENCIES = {"INR"}
PAYMENT_METHOD_ALIASES = {
    "credit card": "Credit Card",
    "debit card": "Debit Card",
    "upi": "UPI",
    "netbanking": "Netbanking",
    "net banking": "Netbanking",
}


class NormalizationError(ValueError):
    def __init__(self, record_id: str | None, field: str, message: str) -> None:
        self.record_id = record_id
        self.field = field
        super().__init__(f"{record_id or '<unknown>'}: {field}: {message}")


def parse_timestamp(value: Any, record_id: str | None = None) -> datetime:
    if value is None or value == "":
        raise NormalizationError(record_id, "timestamp", "timestamp is required")

    if isinstance(value, datetime):
        if value.tzinfo is None:
            return value.replace(tzinfo=IST).astimezone(timezone.utc)
        return value.astimezone(timezone.utc)

    if isinstance(value, (int, float)) or (isinstance(value, str) and value.strip().isdigit()):
        raw = int(value)
        seconds = raw / 1000 if raw >= 10_000_000_000 else raw
        return datetime.fromtimestamp(seconds, tz=timezone.utc)

    text = str(value).strip()

    if "/" in text:
        for fmt in ("%d/%m/%Y %H:%M:%S", "%d/%m/%Y %H:%M", "%d/%m/%Y"):
            try:
                naive = datetime.strptime(text, fmt)
                return naive.replace(tzinfo=IST).astimezone(timezone.utc)
            except ValueError:
                continue
        raise NormalizationError(record_id, "timestamp", f"unrecognised DD/MM/YYYY timestamp: {text}")

    if len(text) == 10 and text[4] == "-" and text[7] == "-":
        try:
            day = date.fromisoformat(text)
        except ValueError as exc:
            raise NormalizationError(record_id, "timestamp", f"invalid date-only timestamp: {text}") from exc
        return datetime.combine(day, time.min, tzinfo=IST).astimezone(timezone.utc)

    iso_text = text.replace("Z", "+00:00")
    try:
        parsed = datetime.fromisoformat(iso_text)
    except ValueError as exc:
        raise NormalizationError(record_id, "timestamp", f"unrecognised timestamp: {text}") from exc

    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=IST)
    return parsed.astimezone(timezone.utc)


def parse_amount(value: Any, record_id: str | None = None) -> Decimal:
    if value is None or value == "":
        raise NormalizationError(record_id, "amount", "amount is required")
    try:
        amount = Decimal(str(value).replace(",", "").strip())
    except (InvalidOperation, ValueError) as exc:
        raise NormalizationError(record_id, "amount", f"invalid amount: {value}") from exc
    return amount.quantize(Decimal("0.01"))


def parse_status(value: Any, record_id: str | None = None) -> str:
    if value is None or str(value).strip() == "":
        raise NormalizationError(record_id, "status", "status is required")
    status = str(value).strip().upper()
    if status not in ALLOWED_STATUSES:
        raise NormalizationError(record_id, "status", f"unsupported status: {value}")
    return status


def parse_currency(value: Any, record_id: str | None = None) -> str:
    currency = str(value or "INR").strip().upper()
    if len(currency) != 3 or currency not in ALLOWED_CURRENCIES:
        raise NormalizationError(record_id, "currency", f"unsupported currency: {value}")
    return currency


def parse_payment_method(value: Any, record_id: str | None = None) -> str:
    if value is None or str(value).strip() == "":
        raise NormalizationError(record_id, "payment_method", "payment_method is required")
    raw = " ".join(str(value).split())
    return PAYMENT_METHOD_ALIASES.get(raw.lower(), raw)


def parse_category(value: Any) -> str | None:
    if value is None:
        return None
    cleaned = str(value).strip()
    return cleaned or None


def parse_merchant(value: Any, record_id: str | None = None) -> str:
    if value is None or str(value).strip() == "":
        raise NormalizationError(record_id, "merchant", "merchant is required")
    return " ".join(str(value).split())


def inclusive_date_bounds(from_date: date | None, to_date: date | None) -> tuple[datetime | None, datetime | None]:
    """Inclusive calendar-day bounds in Asia/Kolkata, stored as UTC."""
    start = datetime.combine(from_date, time.min, tzinfo=IST) if from_date else None
    end = datetime.combine(to_date + timedelta(days=1), time.min, tzinfo=IST) if to_date else None
    return start, end


def normalize_record(raw: dict[str, Any]) -> dict[str, Any]:
    record_id = str(raw.get("id") or "").strip() or None
    if not record_id:
        raise NormalizationError(None, "id", "id is required")

    return {
        "id": record_id,
        "timestamp": parse_timestamp(raw.get("timestamp"), record_id),
        "merchant": parse_merchant(raw.get("merchant"), record_id),
        "category": parse_category(raw.get("category")),
        "amount": parse_amount(raw.get("amount"), record_id),
        "currency": parse_currency(raw.get("currency"), record_id),
        "status": parse_status(raw.get("status"), record_id),
        "payment_method": parse_payment_method(raw.get("payment_method"), record_id),
    }
