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

if DATABASE_URL.startswith("postgresql://"):
    try:
        import psycopg  # noqa: F401
        DATABASE_URL = "postgresql+psycopg://" + DATABASE_URL[len("postgresql://"):]
    except ImportError:
        pass

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


_COURSE_REVIEW_COLUMN_MIGRATIONS = {
    "content_rating": ("INTEGER DEFAULT 5", "INTEGER DEFAULT 5"),
    "quiz_rating": ("INTEGER DEFAULT 5", "INTEGER DEFAULT 5"),
    "nps_score": ("INTEGER DEFAULT 10", "INTEGER DEFAULT 10"),
    "improvement_suggestion": ("TEXT DEFAULT ''", "TEXT DEFAULT ''"),
}


def _apply_column_migrations(conn, is_sqlite: bool, table_name: str, migrations: dict) -> None:
    if is_sqlite:
        table_exists = conn.execute(
            text(f"SELECT name FROM sqlite_master WHERE type='table' AND name='{table_name}'")
        ).fetchone()
        if not table_exists:
            return
        existing_cols = {
            row[1]
            for row in conn.execute(text(f"PRAGMA table_info({table_name})")).fetchall()
        }
        for col_name, (sqlite_def, _) in migrations.items():
            if col_name not in existing_cols:
                conn.execute(
                    text(f"ALTER TABLE {table_name} ADD COLUMN {col_name} {sqlite_def}")
                )
    else:
        table_exists = conn.execute(
            text(f"SELECT to_regclass('public.{table_name}')")
        ).scalar()
        if not table_exists:
            return
        for col_name, (_, pg_def) in migrations.items():
            conn.execute(
                text(f"ALTER TABLE {table_name} ADD COLUMN IF NOT EXISTS {col_name} {pg_def}")
            )


def ensure_schema_migrations(target_engine=engine):
    """Idempotently add newly introduced columns on existing SQLite or Postgres databases."""
    url_str = str(target_engine.url)
    is_sqlite = url_str.startswith("sqlite")
    with target_engine.begin() as conn:
        _apply_column_migrations(conn, is_sqlite, "certificates", _CERTIFICATE_COLUMN_MIGRATIONS)
        _apply_column_migrations(conn, is_sqlite, "course_reviews", _COURSE_REVIEW_COLUMN_MIGRATIONS)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
