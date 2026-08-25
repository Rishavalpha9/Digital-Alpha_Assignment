# AI Usage

## Tools

- Cursor (Grok 4.6)

## Usage

AI was used for:

- scaffolding the FastAPI / Next.js layout
- drafting SQLAlchemy models, Alembic SQL, and seed code
- building the manual transaction table and dashboard components
- suggesting redemption and normalization tests
- iterating on CSS tokens and empty/error states

All generated code was run locally (Postgres seed, pytest, Next.js build) and corrected against actual errors.

## Example 1

AI first inserted every dataset row with `bulk_insert_mappings`.

I rejected/corrected it because:

The supplied `transactions.json` contains 40 duplicated IDs (for example `TXN2025000730`). PostgreSQL correctly rejected the insert.

Final implementation:

Keep the first occurrence of each ID, skip later duplicates, and print `Duplicate IDs skipped` in the seed summary. This preserves identity without silently inventing new keys.

## Example 2

AI initially disabled Redeem on the frontend when `balance < coin_cost`.

I changed it because:

Frontend-only validation would hide the required insufficient-balance API path. The assessment requires the backend to reject unaffordable redemptions and the UI to show that error without mutating the wallet.

Final reasoning:

The Redeem button always opens a confirmation modal. The backend is the source of truth. On failure the cached balance is left untouched (pessimistic update).
