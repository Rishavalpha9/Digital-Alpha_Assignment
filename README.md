# Rishav — Consumer Finance Dashboard

A production-style full-stack dashboard for reviewing ~10,000 Indian consumer payments, exploring spending analytics, and redeeming reward coins.

## Features

- Server-paginated transaction table with merchant search, combined filters, and sorting
- Transaction details drawer/modal, including coins earned
- Category donut and monthly bar charts, with chart-to-table filtering
- Reward catalogue, confirmation flow, atomic redemption, and history
- Loading, empty, and error states throughout
- Responsive layout down to ~360px

## Tech stack

- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS 4, TanStack Query, Recharts
- **Backend:** Python, FastAPI, Pydantic, SQLAlchemy 2, Alembic, psycopg
- **Database:** PostgreSQL 16

## Architecture

The Next.js app talks only to the FastAPI `/api` surface. FastAPI validates input, applies business rules in services/repositories, and queries PostgreSQL. Analytics are computed with SQL `GROUP BY`, not by loading the ledger into Python or the browser. Redemption locks the demo wallet row with `SELECT ... FOR UPDATE` inside a single database transaction.

## Folder structure

```text
.
├── data/transactions.json
├── backend/                 FastAPI app, Alembic, tests
├── frontend/                Next.js app
├── docker-compose.yml       PostgreSQL (+ optional backend image)
├── ASSUMPTIONS.md
├── DECISIONS.md
└── AI-USAGE.md
```

## Prerequisites

- Docker Desktop
- Python 3.12+
- Node.js 20+

## PostgreSQL setup

```bash
docker compose up -d postgres
```

This starts PostgreSQL 16 on `localhost:5432` with user/password/database `finance`.

## Environment variables

Copy `.env.example` to `.env` at the repo root and `backend/.env`. Frontend uses `frontend/.env.local`.

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | SQLAlchemy URL (`postgresql+psycopg://...`) |
| `CORS_ORIGINS` | Comma-separated frontend origins |
| `MAX_COINS_PER_TRANSACTION` | Per-payment coin cap (default `50`) |
| `TRANSACTIONS_JSON` | Path to the supplied dataset |
| `NEXT_PUBLIC_API_URL` | Frontend API base, e.g. `http://localhost:8000/api` |

Never commit a real `.env`.

## Migration command

```bash
cd backend
python -m alembic upgrade head
```

## Seed command

```bash
cd backend
python -m app.db.seed
```

The seed reads `data/transactions.json`, normalizes records, inserts transactions, seeds 6 rewards, and sets the demo wallet to the sum of earned coins.

## Backend startup

```bash
cd backend
python -m pip install -r requirements.txt
python -m alembic upgrade head
python -m app.db.seed
python -m uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

## Frontend startup

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000

## API overview

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/transactions` | Paginated search/filter/sort |
| GET | `/api/transactions/{id}` | Transaction detail |
| GET | `/api/transactions/categories` | Distinct categories |
| GET | `/api/analytics/category-spending` | Spend by category |
| GET | `/api/analytics/monthly-spending` | Spend by month |
| GET | `/api/analytics/summary` | Dashboard summary cards |
| GET | `/api/rewards` | Active rewards |
| GET | `/api/rewards/balance` | Demo wallet balance |
| GET | `/api/rewards/redemptions` | Redemption history |
| POST | `/api/rewards/redeem` | Atomic redemption |
| GET | `/health` | Liveness |

## Testing

```bash
cd backend
python -m pytest
```

Tests cover timestamp/amount/status normalization, transaction filters, analytics, redemption success/failure, and concurrent redemption safety.

## Deployment

- **PostgreSQL:** Neon / Render Postgres
- **Backend:** Render / Railway / Fly.io (`alembic upgrade head` then `python -m app.db.seed` then `uvicorn`)
- **Frontend:** Vercel, with `NEXT_PUBLIC_API_URL` pointing at the deployed API and that origin added to `CORS_ORIGINS`

## Live URLs

- Frontend: not deployed from this workspace yet
- Backend: not deployed from this workspace yet

If a hosted deploy is not available, use the local commands above. A demo video link can be added here if deployment cannot be completed.

## Completed features

- Dataset load of the supplied ~10,000 transactions
- Normalization of mixed timestamps, statuses, amounts, and missing categories
- Manual transaction table with server-side pagination
- Combined filters, sorting, details modal
- Category/monthly analytics and chart → table filtering
- Reward coins, catalogue, confirmation, failure handling, history
- Tests and project documentation

## Known issues

- Hosted deployment URLs are not set from this workspace (no Vercel/Render/Neon credentials were applied). Local Docker + Next/FastAPI is the verified path.
- The supplied dataset includes `TXN2025006262` with amount `999999999.00` (JioMart / Groceries). That single row dominates category and monthly charts. It is preserved, not rewritten.
- The supplied file has 40 duplicated transaction IDs; the seed keeps the first occurrence and reports the rest.
- If port 3000 is already in use, Next.js may start on 3001/3002. Locally the frontend proxies `/api` to FastAPI so CORS is not required for same-origin calls.

## Design decisions

See `DECISIONS.md` for stack and UX choices, and `ASSUMPTIONS.md` for product rules such as the coin cap and date-range inclusivity.
