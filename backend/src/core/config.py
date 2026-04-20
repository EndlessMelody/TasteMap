from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "Backend API"
    API_V1_STR: str = "/api/v1"

    # --- Supabase PostgreSQL ---
    # Transaction pooler (port 6543) — dùng cho app runtime (AsyncEngine)
    # Thêm ?prepared_statement_cache_size=0 để tắt prepared statements
    # vì pgBouncer (transaction mode) không hỗ trợ server-side prepared statements.
    DATABASE_URL: str = "postgresql+asyncpg://user:password@localhost:5432/mydb?prepared_statement_cache_size=0"

    # Direct connection (port 5432) — dùng riêng cho Alembic migrations (DDL)
    DATABASE_URL_DIRECT: str = "postgresql+asyncpg://user:password@localhost:5432/mydb"

    # --- Redis ---
    REDIS_URL: str = "redis://localhost:6379/0"

    # --- Supabase Auth & Storage ---
    SUPABASE_URL: str
    SUPABASE_JWT_SECRET: str
    SUPABASE_ANON_KEY: str | None = None
    SUPABASE_SERVICE_ROLE_KEY: str | None = None
    SUPABASE_PROJECT_REF: str = "bjuikfhjrpmrpbvhduey"

    # --- Groq / OpenAI-compatible LLM ---
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.3-70b-versatile"
    GROQ_VISION_MODEL: str = "llama-3.2-11b-vision-preview"

    # Culture Guide specific settings
    CULTURE_TEXT_MODEL: str = "openai/gpt-oss-120b"
    CULTURE_BANNED_TERMS_EXTRA: str = ""

    # --- Email / SMTP ---
    SMTP_HOST: str | None = None
    SMTP_PORT: int = 587
    SMTP_USER: str | None = None
    SMTP_PASSWORD: str | None = None
    FROM_EMAIL: str = "noreply@tastemap.app"
    FROM_NAME: str = "TasteMap"

    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "ignore"


settings = Settings()
