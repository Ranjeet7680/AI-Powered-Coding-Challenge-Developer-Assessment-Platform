import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base

_DEFAULT_SQLITE_URL = (
    "sqlite:////tmp/coding_task_factory.db"
    if os.getenv("VERCEL")
    else "sqlite:///./coding_task_factory.db"
)
DATABASE_URL = os.getenv("DATABASE_URL", _DEFAULT_SQLITE_URL)

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {},
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

_CERTIFICATE_COLUMN_MIGRATIONS = {
    "issuer_name": "TEXT DEFAULT 'Coding Task Factory Academy'",
    "signatory_name": "TEXT DEFAULT 'Dr. Aris Thorne'",
    "signatory_title": "TEXT DEFAULT 'Chief Curriculum Architect'",
    "score_percent": "INTEGER DEFAULT 98",
    "skills_verified": "TEXT DEFAULT '[]'",
    "challenges_completed": "INTEGER DEFAULT 12",
    "completion_hours": "INTEGER DEFAULT 24",
    "summary": "TEXT DEFAULT ''",
    "credential_hash": "TEXT",
}


def ensure_schema_migrations(target_engine=engine):
    """Idempotently add newly introduced columns on existing SQLite databases."""
    if not str(target_engine.url).startswith("sqlite"):
        return
    with target_engine.begin() as conn:
        table_exists = conn.execute(
            text("SELECT name FROM sqlite_master WHERE type='table' AND name='certificates'")
        ).fetchone()
        if not table_exists:
            return
        existing_cols = {
            row[1]
            for row in conn.execute(text("PRAGMA table_info(certificates)")).fetchall()
        }
        for col_name, col_def in _CERTIFICATE_COLUMN_MIGRATIONS.items():
            if col_name not in existing_cols:
                conn.execute(
                    text(f"ALTER TABLE certificates ADD COLUMN {col_name} {col_def}")
                )


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
