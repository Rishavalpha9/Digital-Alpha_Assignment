from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    database_url: str = "postgresql+psycopg://finance:finance@localhost:5432/finance"
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001"
    max_coins_per_transaction: int = 50
    transactions_json: str = "../data/transactions.json"
    demo_wallet_id: int = 1
    display_timezone: str = "Asia/Kolkata"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def transactions_json_path(self) -> Path:
        path = Path(self.transactions_json)
        if path.is_absolute():
            return path
        backend_dir = Path(__file__).resolve().parents[1]
        return (backend_dir / path).resolve()


@lru_cache
def get_settings() -> Settings:
    return Settings()
