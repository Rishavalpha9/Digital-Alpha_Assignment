.PHONY: postgres migrate seed backend frontend test

postgres:
	docker compose up -d postgres

migrate:
	cd backend && python -m alembic upgrade head

seed:
	cd backend && python -m app.db.seed

backend:
	cd backend && python -m uvicorn app.main:app --reload --port 8000

frontend:
	cd frontend && npm run dev

test:
	cd backend && python -m pytest
