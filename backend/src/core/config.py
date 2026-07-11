from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "Backend API"
    API_V1_STR: str = "/api/v1"

    # --- Environment ---
    ENVIRONMENT: str = "development"  # "development" | "production"

    # --- CORS ---
    # Comma-separated string (NOT list[str] — pydantic-settings JSON-parses list
    # env vars, which breaks on a plain comma-separated value). Empty -> default list.
    ALLOWED_ORIGINS: str = ""

    # Optional regex to additionally allow Vercel preview deployment URLs
    # (e.g. https://tastemap-.*\.vercel\.app) without listing each one explicitly.
    ALLOWED_ORIGIN_REGEX: str = ""

    # --- Rate limiting ---
    RATE_LIMIT_ENABLED: bool = True

    # --- DB connection pool ---
    DB_POOL_SIZE: int = 5
    DB_MAX_OVERFLOW: int = 5

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
    SUPABASE_PROJECT_REF: str = ""

    # --- Groq / OpenAI-compatible LLM ---
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.3-70b-versatile"
    GROQ_VISION_MODEL: str = "llama-3.2-11b-vision-preview"

    # Culture Guide specific settings — must be a model available on Groq
    CULTURE_TEXT_MODEL: str = "llama-3.3-70b-versatile"
    CULTURE_BANNED_TERMS_EXTRA: str = ""

    # --- Membership ---
    MEMBERSHIP_QUOTAS_ENABLED: bool = True

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

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT.lower() == "production"

    @property
    def allowed_origins_list(self) -> list[str]:
        if self.ALLOWED_ORIGINS.strip():
            return [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]
        return [
            "http://localhost:3000",
            "http://localhost:3001",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:3001",
            "https://tastemap-fork-v1.vercel.app",
        ]


settings = Settings()
