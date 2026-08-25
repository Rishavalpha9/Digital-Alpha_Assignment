# Decisions

## Why Next.js

App Router + TypeScript gives a conventional React frontend with a production build path (Vercel) without introducing a separate bundler.

## Why FastAPI

FastAPI gives typed request/response models, OpenAPI at `/docs`, and async-friendly Python while staying simple enough for a clearly layered API.

## Why PostgreSQL

The assessment requires a real relational store. PostgreSQL handles `TIMESTAMPTZ`, `NUMERIC`, indexes, and row-level locks needed for redemption.

## Why SQLAlchemy 2.x

SQLAlchemy provides parameterized queries, Alembic migrations, and `with_for_update()` without handwritten SQL string concatenation.

## Why server-side pagination

The dataset is ~10,000 rows. The API pages 25/50/100 rows and the UI never mounts the full ledger.

## Why TanStack Query

It owns server cache, retries, and invalidation after redemption. Local React state is enough for filters, modals, and chart selection.

## Why Recharts

Lightweight charting with click handlers for category → table filtering. No data-grid dependency.

## Manual table architecture

The transaction table is plain semantic HTML (`table` / `thead` / `tbody`) plus a mobile card alternative. No AG Grid, MUI Table, TanStack Table UI, or shadcn Table.

## Responsive table strategy

Card rows below `md`, sticky-header table from `md` up. Documented in `ASSUMPTIONS.md`.

## Database schema

Four tables: `transactions`, `rewards`, `wallet`, `redemptions`. Wallet has `CHECK (coin_balance >= 0)`. Redemptions reference rewards.

## Indexing strategy

B-tree indexes on `timestamp`, `merchant`, `category`, `status`, `amount`, plus `(status, timestamp)` for analytics. A functional `lower(merchant)` index is created in Alembic to help case-insensitive search. `ILIKE` on 10k rows remains acceptable.

## Reward transaction strategy

`POST /api/rewards/redeem` loads the wallet with `SELECT ... FOR UPDATE`, checks the balance, deducts the exact cost, inserts a redemption row, and commits once. Failures raise before commit, so no coins move.

## Pessimistic redemption update

The UI waits for the API, then invalidates balance/history queries. No optimistic coin deduction, so a failed redeem cannot desync the header.

## Data normalization strategy

A dedicated `app/services/normalize.py` parser converts mixed timestamps, status casing, string amounts, and payment-method aliases. Truly invalid records abort the seed with field-level errors.

## Analytics aggregation strategy

Category and monthly spend are SQL aggregations filtered to successful positive amounts. Monthly buckets use `to_char(... AT TIME ZONE 'Asia/Kolkata', 'YYYY-MM')`.
