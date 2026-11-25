import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base

_DEFAULT_SQLITE_URL = (
    "sqlite:////tmp/coding_task_factory.db"
    if os.getenv("VERCEL")
    else "sqlite:///./coding_task_factory.db"
)

_RAW_DB_URL = (
    os.getenv("DATABASE_URL")
    or os.getenv("POSTGRES_URL")
    or os.getenv("POSTGRES_PRISMA_URL")
    or _DEFAULT_SQLITE_URL
).strip()

if _RAW_DB_URL.startswith("postgres://"):
    DATABASE_URL = "postgresql://" + _RAW_DB_URL[len("postgres://"):]
else:
    DATABASE_URL = _RAW_DB_URL

_IS_SQLITE = DATABASE_URL.startswith("sqlite")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if _IS_SQLITE else {},
    pool_pre_ping=True,
    **({} if _IS_SQLITE else {"pool_recycle": 300, "pool_size": 5, "max_overflow": 10}),
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

_CERTIFICATE_COLUMN_MIGRATIONS = {
    "issuer_name": ("TEXT DEFAULT 'Coding Task Factory Academy'", "VARCHAR DEFAULT 'Coding Task Factory Academy'"),
    "signatory_name": ("TEXT DEFAULT 'Dr. Aris Thorne'", "VARCHAR DEFAULT 'Dr. Aris Thorne'"),
    "signatory_title": ("TEXT DEFAULT 'Chief Curriculum Architect'", "VARCHAR DEFAULT 'Chief Curriculum Architect'"),
    "score_percent": ("INTEGER DEFAULT 98", "INTEGER DEFAULT 98"),
    "skills_verified": ("TEXT DEFAULT '[]'", "JSON DEFAULT '[]'::json"),
    "challenges_completed": ("INTEGER DEFAULT 12", "INTEGER DEFAULT 12"),
    "completion_hours": ("INTEGER DEFAULT 24", "INTEGER DEFAULT 24"),
    "summary": ("TEXT DEFAULT ''", "TEXT DEFAULT ''"),
    "credential_hash": ("TEXT", "VARCHAR"),
}


def ensure_schema_migrations(target_engine=engine):
    """Idempotently add newly introduced columns on existing SQLite or Postgres databases."""
    url_str = str(target_engine.url)
    is_sqlite = url_str.startswith("sqlite")
    with target_engine.begin() as conn:
        if is_sqlite:
            table_exists = conn.execute(
                text("SELECT name FROM sqlite_master WHERE type='table' AND name='certificates'")
            ).fetchone()
            if not table_exists:
                return
            existing_cols = {
                row[1]
                for row in conn.execute(text("PRAGMA table_info(certificates)")).fetchall()
            }
            for col_name, (sqlite_def, _) in _CERTIFICATE_COLUMN_MIGRATIONS.items():
                if col_name not in existing_cols:
                    conn.execute(
                        text(f"ALTER TABLE certificates ADD COLUMN {col_name} {sqlite_def}")
                    )
        else:
            table_exists = conn.execute(
                text("SELECT to_regclass('public.certificates')")
            ).scalar()
            if not table_exists:
                return
            for col_name, (_, pg_def) in _CERTIFICATE_COLUMN_MIGRATIONS.items():
                conn.execute(
                    text(f"ALTER TABLE certificates ADD COLUMN IF NOT EXISTS {col_name} {pg_def}")
                )


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
