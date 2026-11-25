import uuid
import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import Assessment, Certificate, User
from ..schemas import (
    AssessmentCreate,
    AssessmentResponse,
    AssessmentCompleteRequest,
    AssessmentCompleteResponse,
    CertificateResponse,
)
from ..services.pdf_certificate import compute_credential_hash, default_certificate_metadata
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
        "candidates_count": 142,
    },
    {
        "id": "as-fullstack-2",
        "title": "High-Throughput Systems & Algorithms Challenge",
        "description": "Evaluate candidates on optimal memory management, concurrency concepts, and two-pointer stream water trapping algorithms.",
        "duration_minutes": 90,
        "passing_score": 80,
        "challenge_ids": ["c2-lru-cache", "c3-trapping-rain-water"],
        "category": "Systems Engineering",
        "candidates_count": 89,
    },
    {
        "id": "as-intern-3",
        "title": "Junior Developer Core Foundations Assessment",
        "description": "Entry-level programming verification covering arrays, strings, basic recursion, and hash maps.",
        "duration_minutes": 45,
        "passing_score": 65,
        "challenge_ids": ["c1-two-sum", "c4-number-of-islands"],
        "category": "Campus Recruitment",
        "candidates_count": 312,
    },
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
                candidates_count=a["candidates_count"],
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
def create_assessment(
    payload: AssessmentCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    assessment = Assessment(
        id=str(uuid.uuid4()),
        title=payload.title,
        description=payload.description,
        duration_minutes=payload.duration_minutes,
        passing_score=payload.passing_score,
        challenge_ids=payload.challenge_ids,
        category=payload.category,
        created_by=user.id,
        candidates_count=0,
    )
    db.add(assessment)
    db.commit()
    db.refresh(assessment)
    return assessment


@router.post("/{assessment_id}/complete", response_model=AssessmentCompleteResponse)
def complete_assessment(
    assessment_id: str,
    payload: AssessmentCompleteRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    assessment.candidates_count = (assessment.candidates_count or 0) + 1
    passed = payload.score >= assessment.passing_score
    cert_resp = None

    if passed:
        user.points += 100
        existing_cert = (
            db.query(Certificate)
            .filter(Certificate.user_id == user.id, Certificate.title == assessment.title)
            .first()
        )
        if not existing_cert:
            cred_id = f"CTF-{uuid.uuid4().hex[:8].upper()}"
            issue_dt = datetime.datetime.utcnow()
            solved_cnt = max(len(payload.solved_challenge_ids), len(assessment.challenge_ids or []), 1)
            est_hours = max(4, (assessment.duration_minutes or 60) // 10)
            meta = default_certificate_metadata(
                assessment.title,
                assessment.category,
                payload.score,
                solved_cnt,
                est_hours,
            )
            cert = Certificate(
                id=str(uuid.uuid4()),
                user_id=user.id,
                title=assessment.title,
                recipient_name=user.full_name,
                issue_date=issue_dt,
                credential_id=cred_id,
                badge_icon="Award",
                category=assessment.category,
                grade=f"Passed ({payload.score}%)",
                issuer_name=meta["issuer_name"],
                signatory_name=meta["signatory_name"],
                signatory_title=meta["signatory_title"],
                score_percent=payload.score,
                skills_verified=meta["skills_verified"],
                challenges_completed=solved_cnt,
                completion_hours=est_hours,
                summary=meta["summary"],
                credential_hash=compute_credential_hash(
                    cred_id,
                    user.full_name,
                    assessment.title,
                    issue_dt.strftime("%Y-%m-%d"),
                ),
            )
            db.add(cert)
            db.commit()
            db.refresh(cert)
            cert_resp = CertificateResponse.model_validate(cert)
        else:
            cert_resp = CertificateResponse.model_validate(existing_cert)
    else:
        db.commit()

    return AssessmentCompleteResponse(
        assessment_id=assessment.id,
        score=payload.score,
        passed=passed,
        certificate=cert_resp,
    )
