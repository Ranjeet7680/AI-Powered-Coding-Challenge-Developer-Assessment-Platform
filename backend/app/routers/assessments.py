import uuid
import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import Assessment, Challenge, User
from ..schemas import AssessmentCreate, AssessmentResponse
from .auth import get_current_user

router = APIRouter(prefix="/api/assessments", tags=["Assessments"])

SEED_ASSESSMENTS = [
    {
        "id": "as-faang-1",
        "title": "Google & Meta Tier-1 Technical Screener",
        "description": "Standard 60-minute algorithmic and system evaluation covering dynamic programming, graph traversal, and optimized data structure manipulation.",
        "duration_minutes": 60,
        "passing_score": 75,
        "challenge_ids": ["c1-two-sum", "c2-lru-cache"],
        "category": "Enterprise Technical Assessment",
        "candidates_count": 142
    },
    {
        "id": "as-fullstack-2",
        "title": "High-Throughput Systems & Algorithms Challenge",
        "description": "Evaluate candidates on optimal memory management, concurrency concepts, and two-pointer stream water trapping algorithms.",
        "duration_minutes": 90,
        "passing_score": 80,
        "challenge_ids": ["c2-lru-cache", "c3-trapping-rain-water"],
        "category": "Systems Engineering",
        "candidates_count": 89
    },
    {
        "id": "as-intern-3",
        "title": "Junior Developer Core Foundations Assessment",
        "description": "Entry-level programming verification covering arrays, strings, basic recursion, and hash maps.",
        "duration_minutes": 45,
        "passing_score": 65,
        "challenge_ids": ["c1-two-sum", "c4-number-of-islands"],
        "category": "Campus Recruitment",
        "candidates_count": 312
    }
]

def seed_assessments(db: Session):
    for a in SEED_ASSESSMENTS:
        existing = db.query(Assessment).filter(Assessment.id == a["id"]).first()
        if not existing:
            rec = Assessment(
                id=a["id"],
                title=a["title"],
                description=a["description"],
                duration_minutes=a["duration_minutes"],
                passing_score=a["passing_score"],
                challenge_ids=a["challenge_ids"],
                category=a["category"],
                candidates_count=a["candidates_count"]
            )
            db.add(rec)
    db.commit()

@router.get("", response_model=List[AssessmentResponse])
def get_assessments(db: Session = Depends(get_db)):
    assessments = db.query(Assessment).all()
    if not assessments:
        seed_assessments(db)
        assessments = db.query(Assessment).all()
    return assessments

@router.get("/{assessment_id}", response_model=AssessmentResponse)
def get_assessment(assessment_id: str, db: Session = Depends(get_db)):
    rec = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not rec:
        seed_assessments(db)
        rec = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return rec

@router.post("", response_model=AssessmentResponse)
def create_assessment(payload: AssessmentCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    assessment = Assessment(
        id=str(uuid.uuid4()),
        title=payload.title,
        description=payload.description,
        duration_minutes=payload.duration_minutes,
        passing_score=payload.passing_score,
        challenge_ids=payload.challenge_ids,
        category=payload.category,
        created_by=user.id,
        candidates_count=0
    )
    db.add(assessment)
    db.commit()
    db.refresh(assessment)
    return assessment
