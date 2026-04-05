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
    SUPABASE_PROJECT_REF: str = "bjuikfhjrpmrpbvhduey"

    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "ignore"


settings = Settings()
