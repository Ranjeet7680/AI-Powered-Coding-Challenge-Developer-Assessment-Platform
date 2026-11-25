from contextlib import asynccontextmanager
import os

# Load environment variables from .env before importing modules that read os.getenv()
env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")
if os.path.exists(env_path):
    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip())

from fastapi import FastAPI, Depends, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from .database import engine, Base, SessionLocal, ensure_schema_migrations, get_db
from .models import User, Challenge
from .routers import auth, challenges, ai_generator, execution, submissions, assessments, analytics, user, videos, ml_course
from .services.code_runner import get_runtime_capabilities

# Create tables and apply lightweight SQLite column migrations
Base.metadata.create_all(bind=engine)
ensure_schema_migrations(engine)

_BOOTSTRAPPED = False


def ensure_initial_seed(db: Session) -> None:
    """Idempotently ensure demo user, 368+ challenges, assessments, and videos exist."""
    demo = db.query(User).filter(User.email == "developer@codingtaskfactory.io").first()
    if not demo:
        try:
            demo = User(
                id="user-demo-alex",
                email="developer@codingtaskfactory.io",
                hashed_password=auth.hash_pw("Developer@2026!"),
                full_name="Alex Chen",
                role="Senior Full Stack & ML Engineer",
                experience="Advanced",
                preferred_languages=["Python", "TypeScript", "C++"],
                goals=["Practice algorithms", "Prepare for interviews", "Master Machine Learning"],
                avatar_url="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
                points=2450,
                streak=12,
                solved_count=28,
                has_completed_onboarding=True,
            )
            db.add(demo)
            db.commit()
        except IntegrityError:
            db.rollback()

    # Fast-path: avoid re-seeding 368 rows on every cold worker once DB is already populated
    if db.query(Challenge.id).count() >= 360:
        return

    try:
        challenges.seed_initial_challenges(db)
    except IntegrityError:
        db.rollback()
    try:
        assessments.seed_assessments(db)
    except IntegrityError:
        db.rollback()
    try:
        videos.seed_videos(db)
    except IntegrityError:
        db.rollback()


@asynccontextmanager
async def lifespan(_app: FastAPI):
    global _BOOTSTRAPPED
    db = SessionLocal()
    try:
        ensure_initial_seed(db)
        _BOOTSTRAPPED = True
    finally:
        db.close()
    yield


app = FastAPI(
    title="Coding Task Factory API",
    description="Enterprise AI-Powered Coding Challenge & Developer Assessment Platform Backend",
    version="2.1.0",
    lifespan=lifespan,
)


@app.middleware("http")
async def _ensure_serverless_bootstrap(request: Request, call_next):
    global _BOOTSTRAPPED
    if not _BOOTSTRAPPED:
        Base.metadata.create_all(bind=engine)
        ensure_schema_migrations(engine)
        db = SessionLocal()
        try:
            ensure_initial_seed(db)
            _BOOTSTRAPPED = True
        finally:
            db.close()
    return await call_next(request)


_raw_origins = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000",
)
_allowed_origins = [o.strip() for o in _raw_origins.split(",") if o.strip()]
for _env_host_key in ("VERCEL_URL", "VERCEL_BRANCH_URL", "VERCEL_PROJECT_PRODUCTION_URL"):
    _host_val = os.getenv(_env_host_key, "").strip()
    if _host_val:
        _allowed_origins.append(_host_val if _host_val.startswith("http") else f"https://{_host_val}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(challenges.router)
app.include_router(ai_generator.router)
app.include_router(execution.router)
app.include_router(submissions.router)
app.include_router(assessments.router)
app.include_router(analytics.router)
app.include_router(user.router)
app.include_router(videos.router)
app.include_router(ml_course.router)
app.include_router(ml_course.dl_router)


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "service": "Coding Task Factory API",
        "version": "2.0.0",
        "runtimes": get_runtime_capabilities(),
    }


@app.get("/api/platform-stats")
def platform_stats(db: Session = Depends(get_db)):
    challenge_count = db.query(Challenge.id).count()
    return {
        "coding_challenges": f"{max(challenge_count, 368)}+",
        "active_developers": "14,200+",
        "successful_submissions": "182,500+",
        "supported_languages": "4 Core",
    }


# Optional standalone container SPA static serving (used in Docker / GHCR package)
_STATIC_FRONTEND_DIR = os.getenv("STATIC_FRONTEND_DIR", "").strip()
if _STATIC_FRONTEND_DIR and os.path.isdir(_STATIC_FRONTEND_DIR):
    _static_root = os.path.realpath(_STATIC_FRONTEND_DIR)
    _assets_dir = os.path.join(_static_root, "assets")
    if os.path.isdir(_assets_dir):
        app.mount("/assets", StaticFiles(directory=_assets_dir), name="assets")

    @app.get("/{full_path:path}")
    def serve_spa(full_path: str):
        if full_path == "api" or full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="Not Found")
        candidate = os.path.realpath(os.path.join(_static_root, full_path))
        if candidate.startswith(_static_root + os.sep) and os.path.isfile(candidate):
            return FileResponse(candidate)
        return FileResponse(os.path.join(_static_root, "index.html"))
