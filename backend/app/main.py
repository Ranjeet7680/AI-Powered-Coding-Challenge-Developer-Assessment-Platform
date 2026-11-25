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

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import engine, Base, SessionLocal
from .models import User
from .routers import auth, challenges, ai_generator, execution, submissions, assessments, analytics, user, videos

# Create tables
Base.metadata.create_all(bind=engine)


@asynccontextmanager
async def lifespan(_app: FastAPI):
    db = SessionLocal()
    try:
        # Seed default demo user if missing (never attach server GEMINI_API_KEY to user records)
        demo = db.query(User).filter(User.email == "developer@codingtaskfactory.io").first()
        if not demo:
            demo = User(
                id="user-demo-alex",
                email="developer@codingtaskfactory.io",
                hashed_password=auth.hash_pw("demo1234"),
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

        # Seed initial challenges, assessments, and videos
        challenges.seed_initial_challenges(db)
        assessments.seed_assessments(db)
        videos.seed_videos(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="Coding Task Factory API",
    description="Enterprise AI-Powered Coding Challenge & Developer Assessment Platform Backend",
    version="2.0.0",
    lifespan=lifespan,
)

# CORS: explicit allowed origins instead of wildcard with credentials
_raw_origins = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000",
)
_allowed_origins = [o.strip() for o in _raw_origins.split(",") if o.strip()]

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

@app.get("/api/health")
def health():
    return {"status": "ok", "service": "Coding Task Factory API", "version": "2.0.0"}

@app.get("/api/platform-stats")
def platform_stats():
    return {
        "coding_challenges": "500+",
        "active_developers": "14,200+",
        "successful_submissions": "182,500+",
        "supported_languages": "12+"
    }
