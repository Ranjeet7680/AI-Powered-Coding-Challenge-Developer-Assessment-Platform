from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import os
import hashlib
import uuid

from .database import engine, Base, SessionLocal
from .models import User, Challenge, VideoLesson
from .routers import auth, challenges, ai_generator, execution, submissions, assessments, analytics, user, videos

# Load environment variables from .env if present
env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")
if os.path.exists(env_path):
    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip())

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Coding Task Factory API",
    description="Enterprise AI-Powered Coding Challenge & Developer Assessment Platform Backend",
    version="2.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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

@app.on_event("startup")
def on_startup():
    db = SessionLocal()
    try:
        # Check if default demo user exists
        demo = db.query(User).filter(User.email == "developer@codingtaskfactory.io").first()
        if not demo:
            demo = User(
                id="user-demo-alex",
                email="developer@codingtaskfactory.io",
                hashed_password=hashlib.sha256("demo1234".encode()).hexdigest(),
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
                gemini_api_key=os.getenv("GEMINI_API_KEY", "")
            )
            db.add(demo)
            db.commit()
        else:
            demo.gemini_api_key = os.getenv("GEMINI_API_KEY", "")
            db.commit()

        # Seed initial challenges, assessments, and videos
        challenges.seed_initial_challenges(db)
        assessments.seed_assessments(db)
        videos.seed_videos(db)
    finally:
        db.close()

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
