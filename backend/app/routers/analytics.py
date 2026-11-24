import uuid
import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from ..database import get_db
from ..models import User, Submission, Certificate
from ..schemas import AnalyticsSummary, CertificateResponse
from .auth import get_current_user

router = APIRouter(prefix="/api", tags=["Analytics & Leaderboard"])

SEED_CERTIFICATES = [
    {
        "id": "cert-1",
        "title": "Mastery of Algorithmic Problem Solving",
        "badge_icon": "Award",
        "category": "Data Structures & Algorithms",
        "grade": "Distinction (98%)"
    },
    {
        "id": "cert-2",
        "title": "Full-Stack System Architecture & Coding",
        "badge_icon": "CheckCircle2",
        "category": "Enterprise Software Engineering",
        "grade": "High Honors (95%)"
    },
    {
        "id": "cert-3",
        "title": "AI-Assisted Autonomous Code Engineering",
        "badge_icon": "Sparkles",
        "category": "Applied AI Engineering",
        "grade": "Certified Expert"
    }
]

@router.get("/analytics", response_model=AnalyticsSummary)
def get_analytics(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    submissions = db.query(Submission).filter(Submission.user_id == user.id).all()
    total_submissions = len(submissions)
    accepted = len([s for s in submissions if s.status == "Accepted"])
    
    success_rate = round((accepted / total_submissions * 100), 1) if total_submissions > 0 else 88.5
    solved_count = max(user.solved_count, accepted)

    # Weekly coding distribution
    weekly_activity = [
        {"day": "Mon", "submissions": 8, "solved": 7, "score": 92},
        {"day": "Tue", "submissions": 12, "solved": 11, "score": 95},
        {"day": "Wed", "submissions": 6, "solved": 5, "score": 88},
        {"day": "Thu", "submissions": 15, "solved": 14, "score": 98},
        {"day": "Fri", "submissions": 10, "solved": 9, "score": 90},
        {"day": "Sat", "submissions": 18, "solved": 16, "score": 94},
        {"day": "Sun", "submissions": 14, "solved": 13, "score": 96}
    ]

    skills_radar = [
        {"subject": "Algorithms", "score": 92, "fullMark": 100},
        {"subject": "Data Structures", "score": 88, "fullMark": 100},
        {"subject": "Optimization", "score": 85, "fullMark": 100},
        {"subject": "Problem Solving", "score": 96, "fullMark": 100},
        {"subject": "Code Quality", "score": 90, "fullMark": 100},
        {"subject": "Concurrency", "score": 78, "fullMark": 100}
    ]

    difficulty_breakdown = {
        "Easy": max(12, int(solved_count * 0.4)),
        "Medium": max(10, int(solved_count * 0.45)),
        "Hard": max(6, int(solved_count * 0.15))
    }

    language_breakdown = {
        "Python": 42,
        "TypeScript": 28,
        "JavaScript": 18,
        "C++": 12
    }

    return AnalyticsSummary(
        total_challenges_solved=solved_count,
        success_rate=success_rate,
        current_streak=user.streak,
        total_points=user.points,
        global_rank=184,
        weekly_activity=weekly_activity,
        difficulty_breakdown=difficulty_breakdown,
        language_breakdown=language_breakdown,
        skills_radar=skills_radar
    )

@router.get("/leaderboard")
def get_leaderboard(db: Session = Depends(get_db)):
    # Return competitive developer leaderboard
    return [
        {
            "rank": 1,
            "name": "Sarah Lin",
            "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
            "role": "Principal Engineer @ Databricks",
            "points": 5420,
            "solved": 142,
            "streak": 45,
            "badge": "Grandmaster",
            "win_rate": "98.2%"
        },
        {
            "rank": 2,
            "name": "Marcus Vance",
            "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
            "role": "Senior Systems Architect",
            "points": 4890,
            "solved": 128,
            "streak": 32,
            "badge": "Code Wizard",
            "win_rate": "95.4%"
        },
        {
            "rank": 3,
            "name": "Priya Sharma",
            "avatar": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
            "role": "AI Research Engineer",
            "points": 4350,
            "solved": 115,
            "streak": 28,
            "badge": "Algorithm Master",
            "win_rate": "94.8%"
        },
        {
            "rank": 4,
            "name": "David Kim",
            "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
            "role": "Staff Software Engineer",
            "points": 3980,
            "solved": 98,
            "streak": 21,
            "badge": "Speed Demon",
            "win_rate": "92.0%"
        },
        {
            "rank": 5,
            "name": "Elena Rostova",
            "avatar": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
            "role": "Competitive Programmer",
            "points": 3670,
            "solved": 89,
            "streak": 19,
            "badge": "Problem Solver",
            "win_rate": "91.5%"
        },
        {
            "rank": 6,
            "name": "Alex Chen (You)",
            "avatar": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
            "role": "Full Stack Engineer",
            "points": 2450,
            "solved": 28,
            "streak": 12,
            "badge": "Rising Star",
            "win_rate": "89.4%"
        }
    ]

@router.get("/certificates", response_model=List[CertificateResponse])
def get_certificates(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    certs = db.query(Certificate).filter(Certificate.user_id == user.id).all()
    if not certs:
        # Seed initial certificates for user
        for sc in SEED_CERTIFICATES:
            c = Certificate(
                id=str(uuid.uuid4()),
                user_id=user.id,
                title=sc["title"],
                recipient_name=user.full_name or "Alex Chen",
                issue_date=datetime.datetime.utcnow() - datetime.timedelta(days=14),
                credential_id=f"CTF-{uuid.uuid4().hex[:8].upper()}",
                badge_icon=sc["badge_icon"],
                category=sc["category"],
                grade=sc["grade"]
            )
            db.add(c)
        db.commit()
        certs = db.query(Certificate).filter(Certificate.user_id == user.id).all()
    
    return [CertificateResponse.from_orm(c) for c in certs]
