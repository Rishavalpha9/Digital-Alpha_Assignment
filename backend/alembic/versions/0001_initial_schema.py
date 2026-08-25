from alembic import op

revision = "0001_initial_schema"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        """
        CREATE TABLE transactions (
            id VARCHAR(64) PRIMARY KEY,
            timestamp TIMESTAMPTZ NOT NULL,
            merchant VARCHAR(255) NOT NULL,
            category VARCHAR(128) NULL,
            amount NUMERIC(14, 2) NOT NULL,
            currency VARCHAR(3) NOT NULL,
            status VARCHAR(16) NOT NULL,
            payment_method VARCHAR(64) NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
        """
    )
    op.execute("CREATE INDEX ix_transactions_timestamp ON transactions (timestamp)")
    op.execute("CREATE INDEX ix_transactions_merchant ON transactions (merchant)")
    op.execute("CREATE INDEX ix_transactions_category ON transactions (category)")
    op.execute("CREATE INDEX ix_transactions_status ON transactions (status)")
    op.execute("CREATE INDEX ix_transactions_amount ON transactions (amount)")
    op.execute("CREATE INDEX ix_transactions_status_timestamp ON transactions (status, timestamp)")
    op.execute("CREATE INDEX ix_transactions_merchant_lower ON transactions (lower(merchant))")

    op.execute(
        """
        CREATE TABLE rewards (
            id SERIAL PRIMARY KEY,
            name VARCHAR(128) NOT NULL,
            description VARCHAR(512) NOT NULL,
            coin_cost INTEGER NOT NULL,
            reward_type VARCHAR(64) NOT NULL,
            active BOOLEAN NOT NULL DEFAULT TRUE,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
        """
    )

    op.execute(
        """
        CREATE TABLE wallet (
            id INTEGER PRIMARY KEY,
            coin_balance INTEGER NOT NULL DEFAULT 0,
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            CONSTRAINT ck_wallet_balance_nonneg CHECK (coin_balance >= 0)
        )
        """
    )

    op.execute(
        """
        CREATE TABLE redemptions (
            id SERIAL PRIMARY KEY,
            reward_id INTEGER NOT NULL REFERENCES rewards(id),
            coins_spent INTEGER NOT NULL,
            status VARCHAR(16) NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
        """
    )
    op.execute("CREATE INDEX ix_redemptions_reward_id ON redemptions (reward_id)")


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS redemptions")
    op.execute("DROP TABLE IF EXISTS wallet")
    op.execute("DROP TABLE IF EXISTS rewards")
    op.execute("DROP TABLE IF EXISTS transactions")
