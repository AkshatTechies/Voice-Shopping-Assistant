"""
App-wide configuration, loaded from environment variables.
For Phase 1 we only need the database URL — everything else
(LLM keys, Whisper, vector DB) gets added in later phases.
"""

import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    # SQLite for local dev — swap for a Postgres/Supabase URL later
    # by just changing this env var, no code changes needed.
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", "sqlite:///./shopping_assistant.db"
    )

    # Placeholders for future phases — safe to leave unset for now.
    LLM_API_KEY: str = os.getenv("LLM_API_KEY", "")
    VECTOR_DB_PATH: str = os.getenv("VECTOR_DB_PATH", "./chroma_store")

    # Auth. In dev this falls back to an insecure default so the app
    # still runs without extra setup — set JWT_SECRET_KEY in .env
    # before deploying anywhere real.
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "dev-only-insecure-secret-change-me")
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = int(os.getenv("JWT_EXPIRE_MINUTES", "10080"))  # 7 days


settings = Settings()
