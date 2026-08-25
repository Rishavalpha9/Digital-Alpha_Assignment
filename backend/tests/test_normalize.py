from datetime import date, datetime, timezone
from decimal import Decimal

import pytest

from app.services.normalize import NormalizationError, normalize_record, parse_timestamp
from app.services.rewards import coins_earned


def test_iso_z_timestamp() -> None:
    parsed = parse_timestamp("2025-10-03T21:03:27Z")
    assert parsed.tzinfo is not None
    assert parsed == datetime(2025, 10, 3, 21, 3, 27, tzinfo=timezone.utc)


def test_timezone_offset_timestamp() -> None:
    parsed = parse_timestamp("2026-03-25T06:08:03+05:30")
    assert parsed == datetime(2026, 3, 25, 0, 38, 3, tzinfo=timezone.utc)


def test_date_only_timestamp_is_midnight_ist() -> None:
    parsed = parse_timestamp("2025-07-03")
    assert parsed == datetime(2025, 7, 2, 18, 30, tzinfo=timezone.utc)


def test_dd_mm_yyyy_timestamp() -> None:
    parsed = parse_timestamp("12/10/2025 16:24:49")
    assert parsed.tzinfo is not None
    assert parsed.year == 2025
    assert parsed.month == 10
    assert parsed.day == 12 or parsed.day == 11


def test_epoch_milliseconds() -> None:
    parsed = parse_timestamp(1768265109000)
    assert parsed == datetime.fromtimestamp(1768265109, tz=timezone.utc)


def test_null_category_preserved() -> None:
    record = normalize_record(
        {
            "id": "TXNTEST1",
            "timestamp": "2025-10-03T21:03:27Z",
            "merchant": "Amazon",
            "category": None,
            "amount": 100,
            "currency": "INR",
            "status": "SUCCESS",
            "payment_method": "UPI",
        }
    )
    assert record["category"] is None


def test_negative_amount_preserved() -> None:
    record = normalize_record(
        {
            "id": "TXNTEST2",
            "timestamp": "2025-10-03T21:03:27Z",
            "merchant": "Swiggy",
            "category": "Food & Dining",
            "amount": -477.46,
            "currency": "INR",
            "status": "SUCCESS",
            "payment_method": "UPI",
        }
    )
    assert record["amount"] == Decimal("-477.46")


def test_string_amount() -> None:
    record = normalize_record(
        {
            "id": "TXNTEST3",
            "timestamp": "2025-10-03T21:03:27Z",
            "merchant": "Amazon",
            "category": "Shopping",
            "amount": "5065.00",
            "currency": "inr",
            "status": "SUCCESS",
            "payment_method": "credit card",
        }
    )
    assert record["amount"] == Decimal("5065.00")
    assert record["currency"] == "INR"
    assert record["payment_method"] == "Credit Card"


def test_lowercase_status() -> None:
    record = normalize_record(
        {
            "id": "TXNTEST4",
            "timestamp": "2025-10-03T21:03:27Z",
            "merchant": "Amazon",
            "category": "Shopping",
            "amount": 200,
            "currency": "INR",
            "status": "success",
            "payment_method": "UPI",
        }
    )
    assert record["status"] == "SUCCESS"


def test_missing_id_rejected() -> None:
    with pytest.raises(NormalizationError):
        normalize_record(
            {
                "timestamp": "2025-10-03T21:03:27Z",
                "merchant": "Amazon",
                "amount": 200,
                "currency": "INR",
                "status": "SUCCESS",
                "payment_method": "UPI",
            }
        )


def test_invalid_timestamp_rejected() -> None:
    with pytest.raises(NormalizationError):
        parse_timestamp("not-a-date", "TXNTEST5")


def test_coins_only_for_successful_positive_amounts() -> None:
    assert coins_earned(Decimal("912.62"), "SUCCESS", cap=50) == 9
    assert coins_earned(Decimal("12000"), "SUCCESS", cap=50) == 50
    assert coins_earned(Decimal("99.99"), "SUCCESS", cap=50) == 0
    assert coins_earned(Decimal("200"), "FAILED", cap=50) == 0
    assert coins_earned(Decimal("200"), "PENDING", cap=50) == 0
    assert coins_earned(Decimal("-500"), "SUCCESS", cap=50) == 0
