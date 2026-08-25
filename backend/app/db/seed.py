"""Seed PostgreSQL from the supplied transactions.json dataset."""

from __future__ import annotations

import json
import sys
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

from sqlalchemy import text

from app.config import get_settings
from app.database import SessionLocal
from app.models import Reward, Transaction, Wallet
from app.services.normalize import NormalizationError, normalize_record
from app.services.rewards import coins_earned

REWARD_CATALOGUE = [
    {
        "name": "₹100 Cashback",
        "description": "Instant cashback credited toward your next successful payment.",
        "coin_cost": 500,
        "reward_type": "CASHBACK",
    },
    {
        "name": "Swiggy Voucher",
        "description": "₹150 off food delivery from your favourite restaurants.",
        "coin_cost": 750,
        "reward_type": "VOUCHER",
    },
    {
        "name": "Amazon Voucher",
        "description": "₹250 Amazon Pay voucher for shopping, bills, and more.",
        "coin_cost": 1000,
        "reward_type": "VOUCHER",
    },
    {
        "name": "BookMyShow Treat",
        "description": "₹300 entertainment voucher for movies, events, and plays.",
        "coin_cost": 1500,
        "reward_type": "ENTERTAINMENT",
    },
    {
        "name": "IndiGo Flight Credit",
        "description": "₹1,000 travel credit toward domestic flights.",
        "coin_cost": 2500,
        "reward_type": "TRAVEL",
    },
    {
        "name": "International Travel Pack",
        "description": "Premium holiday credit for flights and stays. A stretch goal for heavy spenders.",
        "coin_cost": 500000,
        "reward_type": "TRAVEL",
    },
]


def load_raw_records(path: Path) -> list[dict]:
    if not path.exists():
        raise FileNotFoundError(f"transactions dataset not found at {path}")
    with path.open(encoding="utf-8") as handle:
        payload = json.load(handle)
    if isinstance(payload, dict) and "transactions" in payload:
        payload = payload["transactions"]
    if not isinstance(payload, list):
        raise ValueError("transactions.json must contain a JSON array of records")
    return payload


def seed() -> None:
    settings = get_settings()
    dataset_path = settings.transactions_json_path
    raw_records = load_raw_records(dataset_path)

    normalized: list[dict] = []
    invalid: list[str] = []
    for raw in raw_records:
        try:
            if not isinstance(raw, dict):
                raise NormalizationError(None, "record", "each record must be an object")
            normalized.append(normalize_record(raw))
        except NormalizationError as exc:
            invalid.append(str(exc))

    if invalid:
        preview = "\n".join(invalid[:20])
        raise SystemExit(
            f"Seed aborted. {len(invalid)} invalid record(s).\n{preview}"
        )

    now = datetime.now(timezone.utc)
    cap = settings.max_coins_per_transaction
    status_counts: Counter[str] = Counter()
    missing_categories = 0
    total_coins = 0
    seen_ids: set[str] = set()
    duplicate_ids: list[str] = []

    rows = []
    for record in normalized:
        if record["id"] in seen_ids:
            duplicate_ids.append(record["id"])
            continue
        seen_ids.add(record["id"])
        status_counts[record["status"]] += 1
        if record["category"] is None:
            missing_categories += 1
        total_coins += coins_earned(record["amount"], record["status"], cap)
        rows.append({**record, "created_at": now})

    db = SessionLocal()
    try:
        db.execute(text("TRUNCATE TABLE redemptions, wallet, rewards, transactions RESTART IDENTITY CASCADE"))
        db.commit()

        db.bulk_insert_mappings(Transaction, rows)

        rewards = [
            Reward(
                name=item["name"],
                description=item["description"],
                coin_cost=item["coin_cost"],
                reward_type=item["reward_type"],
                active=True,
            )
            for item in REWARD_CATALOGUE
        ]
        db.add_all(rewards)
        db.add(
            Wallet(
                id=settings.demo_wallet_id,
                coin_balance=total_coins,
                updated_at=now,
            )
        )
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()

    inserted_count = len(rows)
    print("Seed completed successfully.")
    print()
    print(f"Records read:       {len(raw_records)}")
    print(f"Records inserted:   {inserted_count}")
    print(f"Invalid records:    {len(invalid)}")
    print(f"Duplicate IDs skipped: {len(duplicate_ids)}")
    print(f"Missing categories: {missing_categories}")
    print(f"Successful:         {status_counts.get('SUCCESS', 0)}")
    print(f"Failed:             {status_counts.get('FAILED', 0)}")
    print(f"Pending:            {status_counts.get('PENDING', 0)}")
    print(f"Initial coins:      {total_coins}")


if __name__ == "__main__":
    try:
        seed()
    except Exception as exc:
        print(f"Seed failed: {exc}", file=sys.stderr)
        raise
