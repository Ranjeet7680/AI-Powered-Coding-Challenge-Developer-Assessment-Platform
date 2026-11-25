import uuid
import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from ..database import get_db
from ..models import User, Submission, Certificate, Challenge
from ..schemas import AnalyticsSummary, CertificateResponse, CertificateVerifyResponse
from ..services.pdf_certificate import (
    compute_credential_hash,
    default_certificate_metadata,
    generate_certificate_pdf,
)
from .auth import get_current_user, get_optional_user

router = APIRouter(prefix="/api", tags=["Analytics & Leaderboard"])

SEED_CERTIFICATES = [
    {
        "id": "cert-1",
        "title": "Mastery of Algorithmic Problem Solving",
        "badge_icon": "Award",
        "category": "Data Structures & Algorithms",
        "grade": "Distinction (98%)",
        "score_percent": 98,
        "challenges_completed": 42,
        "completion_hours": 36,
        "skills_verified": [
            "Dynamic Programming",
            "Graph Traversal",
            "Hash Maps & Trees",
            "Asymptotic Complexity",
            "Sliding Window",
        ],
    },
    {
        "id": "cert-2",
        "title": "Full-Stack System Architecture & Coding",
        "badge_icon": "CheckCircle2",
        "category": "Enterprise Software Engineering",
        "grade": "High Honors (95%)",
        "score_percent": 95,
        "challenges_completed": 28,
        "completion_hours": 28,
        "skills_verified": [
            "Concurrent Systems",
            "API Architecture",
            "Memory Efficiency",
            "Distributed Patterns",
            "Clean TypeScript & Python",
        ],
    },
    {
        "id": "cert-3",
        "title": "AI-Assisted Autonomous Code Engineering",
        "badge_icon": "Sparkles",
        "category": "Applied AI Engineering",
        "grade": "Certified Expert (97%)",
        "score_percent": 97,
        "challenges_completed": 24,
        "completion_hours": 22,
        "skills_verified": [
            "ML Foundations",
            "Vector Search & RAG",
            "Gradient Optimization",
            "AI Code Auditing",
            "Evaluation Harnesses",
        ],
    },
]

BENCHMARK_PEERS = [
    {
        "name": "Sarah Lin",
        "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
        "role": "Principal Engineer @ Databricks",
        "points": 5420,
        "weekly_points": 840,
        "solved": 142,
        "weekly_solved": 18,
        "streak": 45,
        "badge": "Grandmaster",
        "win_rate": "98.2%",
    },
    {
        "name": "Marcus Vance",
        "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        "role": "Senior Systems Architect",
        "points": 4890,
        "weekly_points": 720,
        "solved": 128,
        "weekly_solved": 15,
        "streak": 32,
        "badge": "Code Wizard",
        "win_rate": "95.4%",
    },
    {
        "name": "Priya Sharma",
        "avatar": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
        "role": "AI Research Engineer",
        "points": 4350,
        "weekly_points": 910,
        "solved": 115,
        "weekly_solved": 21,
        "streak": 28,
        "badge": "Algorithm Master",
        "win_rate": "94.8%",
    },
    {
        "name": "David Kim",
        "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
        "role": "Staff Software Engineer",
        "points": 3980,
        "weekly_points": 610,
        "solved": 98,
        "weekly_solved": 12,
        "streak": 21,
        "badge": "Speed Demon",
        "win_rate": "92.0%",
    },
    {
        "name": "Elena Rostova",
        "avatar": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
        "role": "Competitive Programmer",
        "points": 3670,
        "weekly_points": 690,
        "solved": 89,
        "weekly_solved": 14,
        "streak": 19,
        "badge": "Problem Solver",
        "win_rate": "91.5%",
    },
]


@router.get("/analytics", response_model=AnalyticsSummary)
def get_analytics(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    submissions = db.query(Submission).filter(Submission.user_id == user.id).all()
    total_submissions = len(submissions)
    accepted_subs = [s for s in submissions if s.status == "Accepted"]
    accepted_count = len(accepted_subs)

    success_rate = round((accepted_count / total_submissions * 100), 1) if total_submissions > 0 else 88.5
    unique_solved_ids = {s.challenge_id for s in accepted_subs}
    solved_count = max(user.solved_count, len(unique_solved_ids))

    # Build weekly activity from real submissions + baseline activity
    days_order = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    day_stats: Dict[str, Dict[str, Any]] = {
        d: {"day": d, "submissions": 0, "solved": 0, "score_sum": 0}
        for d in days_order
    }
    for s in submissions:
        day_name = days_order[s.created_at.weekday()] if s.created_at else "Mon"
        day_stats[day_name]["submissions"] += 1
        if s.status == "Accepted":
            day_stats[day_name]["solved"] += 1
        day_stats[day_name]["score_sum"] += s.score or 0

    if total_submissions > 0:
        weekly_activity = [
            {
                "day": d,
                "submissions": day_stats[d]["submissions"],
                "solved": day_stats[d]["solved"],
                "score": round(day_stats[d]["score_sum"] / day_stats[d]["submissions"])
                if day_stats[d]["submissions"] > 0
                else 0,
            }
            for d in days_order
        ]
    else:
        weekly_activity = [
            {"day": "Mon", "submissions": 4, "solved": 3, "score": 88},
            {"day": "Tue", "submissions": 7, "solved": 6, "score": 92},
            {"day": "Wed", "submissions": 5, "solved": 4, "score": 86},
            {"day": "Thu", "submissions": 9, "solved": 8, "score": 95},
            {"day": "Fri", "submissions": 6, "solved": 5, "score": 91},
            {"day": "Sat", "submissions": 11, "solved": 10, "score": 94},
            {"day": "Sun", "submissions": 8, "solved": 7, "score": 96},
        ]

    # Language breakdown from real submissions (or preferred languages fallback)
    language_breakdown: Dict[str, int] = {}
    for s in submissions:
        label = s.language.capitalize() if s.language.lower() != "cpp" else "C++"
        if label.lower() == "typescript":
            label = "TypeScript"
        elif label.lower() == "javascript":
            label = "JavaScript"
        language_breakdown[label] = language_breakdown.get(label, 0) + 1

    if not language_breakdown:
        language_breakdown = {"Python": 42, "TypeScript": 28, "JavaScript": 18, "C++": 12}

    # Difficulty breakdown from solved challenges
    difficulty_breakdown = {"Easy": 0, "Medium": 0, "Hard": 0}
    if unique_solved_ids:
        solved_challenges = db.query(Challenge).filter(Challenge.id.in_(unique_solved_ids)).all()
        for ch in solved_challenges:
            tier = ch.difficulty if ch.difficulty in difficulty_breakdown else "Medium"
            difficulty_breakdown[tier] += 1
    if sum(difficulty_breakdown.values()) == 0:
        difficulty_breakdown = {
            "Easy": max(1, int(solved_count * 0.4)),
            "Medium": max(1, int(solved_count * 0.45)),
            "Hard": max(0, solved_count - max(1, int(solved_count * 0.4)) - max(1, int(solved_count * 0.45))),
        }

    # Dynamic skills radar calibrated by real performance
    avg_cleanliness = (
        round(sum((s.ai_feedback or {}).get("cleanliness_score", 88) for s in submissions) / total_submissions)
        if total_submissions > 0
        else 90
    )
    avg_efficiency = (
        round(sum((s.ai_feedback or {}).get("efficiency_score", 85) for s in submissions) / total_submissions)
        if total_submissions > 0
        else 86
    )

    skills_radar = [
        {"subject": "Algorithms", "score": min(99, int(72 + success_rate * 0.24)), "fullMark": 100},
        {"subject": "Data Structures", "score": min(99, 76 + min(20, solved_count)), "fullMark": 100},
        {"subject": "Optimization", "score": min(99, avg_efficiency), "fullMark": 100},
        {"subject": "Problem Solving", "score": min(99, int(75 + success_rate * 0.22)), "fullMark": 100},
        {"subject": "Code Quality", "score": min(99, avg_cleanliness), "fullMark": 100},
        {"subject": "Consistency", "score": min(99, 65 + min(33, user.streak * 2)), "fullMark": 100},
    ]

    # Dynamic global rank estimate
    higher_peers = sum(1 for p in BENCHMARK_PEERS if p["points"] > user.points)
    global_rank = max(1, higher_peers + 1 if user.points >= 2500 else 184 - min(150, user.solved_count * 3))

    return AnalyticsSummary(
        total_challenges_solved=solved_count,
        success_rate=success_rate,
        current_streak=user.streak,
        total_points=user.points,
        global_rank=global_rank,
        weekly_activity=weekly_activity,
        difficulty_breakdown=difficulty_breakdown,
        language_breakdown=language_breakdown,
        skills_radar=skills_radar,
    )


@router.get("/leaderboard")
def get_leaderboard(
    period: str = Query("all", pattern="^(all|weekly)$"),
    user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    entries = []
    for p in BENCHMARK_PEERS:
        entries.append(
            {
                "name": p["name"],
                "avatar": p["avatar"],
                "role": p["role"],
                "points": p["weekly_points"] if period == "weekly" else p["points"],
                "solved": p["weekly_solved"] if period == "weekly" else p["solved"],
                "streak": p["streak"],
                "badge": p["badge"],
                "win_rate": p["win_rate"],
                "is_current_user": False,
            }
        )

    if user:
        subs = db.query(Submission).filter(Submission.user_id == user.id).all()
        accepted = sum(1 for s in subs if s.status == "Accepted")
        win_rate = f"{round((accepted / len(subs)) * 100, 1)}%" if subs else "89.4%"
        weekly_pts = sum((s.score or 0) // 2 for s in subs if s.status == "Accepted") or min(640, user.streak * 45)
        entries.append(
            {
                "name": f"{user.full_name} (You)",
                "avatar": user.avatar_url
                or "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
                "role": user.role or "Developer",
                "points": weekly_pts if period == "weekly" else user.points,
                "solved": accepted if period == "weekly" and subs else user.solved_count,
                "streak": user.streak,
                "badge": "Grandmaster" if user.points >= 4500 else ("Algorithm Master" if user.points >= 3000 else "Rising Star"),
                "win_rate": win_rate,
                "is_current_user": True,
            }
        )
    else:
        entries.append(
            {
                "name": "Alex Chen (Demo)",
                "avatar": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
                "role": "Full Stack Engineer",
                "points": 520 if period == "weekly" else 2450,
                "solved": 9 if period == "weekly" else 28,
                "streak": 12,
                "badge": "Rising Star",
                "win_rate": "89.4%",
                "is_current_user": False,
            }
        )

    entries.sort(key=lambda x: x["points"], reverse=True)
    for idx, item in enumerate(entries):
        item["rank"] = idx + 1

    return entries


def _ensure_cert_enriched(cert: Certificate, db: Session) -> bool:
    """Backfill rich metadata fields on legacy certificate records if empty."""
    changed = False
    meta = default_certificate_metadata(
        cert.title,
        cert.category,
        cert.score_percent or 98,
        cert.challenges_completed or 12,
        cert.completion_hours or 24,
    )
    if not cert.issuer_name:
        cert.issuer_name = meta["issuer_name"]
        changed = True
    if not cert.signatory_name:
        cert.signatory_name = meta["signatory_name"]
        changed = True
    if not cert.signatory_title:
        cert.signatory_title = meta["signatory_title"]
        changed = True
    if not cert.score_percent:
        cert.score_percent = meta["score_percent"]
        changed = True
    if not cert.skills_verified:
        cert.skills_verified = meta["skills_verified"]
        changed = True
    if not cert.challenges_completed:
        cert.challenges_completed = meta["challenges_completed"]
        changed = True
    if not cert.completion_hours:
        cert.completion_hours = meta["completion_hours"]
        changed = True
    if not cert.summary:
        cert.summary = meta["summary"]
        changed = True
    if not cert.credential_hash:
        issue_iso = (cert.issue_date or datetime.datetime.utcnow()).strftime("%Y-%m-%d")
        cert.credential_hash = compute_credential_hash(
            cert.credential_id,
            cert.recipient_name,
            cert.title,
            issue_iso,
        )
        changed = True
    if changed:
        db.flush()
    return changed


@router.get("/certificates", response_model=List[CertificateResponse])
def get_certificates(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    certs = (
        db.query(Certificate)
        .filter(Certificate.user_id == user.id)
        .order_by(Certificate.issue_date.desc())
        .all()
    )
    if not certs:
        for sc in SEED_CERTIFICATES:
            cred_id = f"CTF-{uuid.uuid4().hex[:8].upper()}"
            issue_dt = datetime.datetime.utcnow() - datetime.timedelta(days=14)
            recipient = user.full_name or "Developer"
            meta = default_certificate_metadata(
                sc["title"],
                sc["category"],
                sc["score_percent"],
                sc["challenges_completed"],
                sc["completion_hours"],
            )
            c = Certificate(
                id=str(uuid.uuid4()),
                user_id=user.id,
                title=sc["title"],
                recipient_name=recipient,
                issue_date=issue_dt,
                credential_id=cred_id,
                badge_icon=sc["badge_icon"],
                category=sc["category"],
                grade=sc["grade"],
                issuer_name=meta["issuer_name"],
                signatory_name=meta["signatory_name"],
                signatory_title=meta["signatory_title"],
                score_percent=sc["score_percent"],
                skills_verified=sc["skills_verified"],
                challenges_completed=sc["challenges_completed"],
                completion_hours=sc["completion_hours"],
                summary=meta["summary"],
                credential_hash=compute_credential_hash(
                    cred_id, recipient, sc["title"], issue_dt.strftime("%Y-%m-%d")
                ),
            )
            db.add(c)
        db.commit()
        certs = (
            db.query(Certificate)
            .filter(Certificate.user_id == user.id)
            .order_by(Certificate.issue_date.desc())
            .all()
        )
    else:
        any_changed = any(_ensure_cert_enriched(c, db) for c in certs)
        if any_changed:
            db.commit()

    return [CertificateResponse.model_validate(c) for c in certs]


@router.get("/certificates/{credential_id}/verify", response_model=CertificateVerifyResponse)
def verify_certificate(credential_id: str, db: Session = Depends(get_db)):
    cert = (
        db.query(Certificate)
        .filter((Certificate.credential_id == credential_id) | (Certificate.id == credential_id))
        .first()
    )
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate credential not found")
    if _ensure_cert_enriched(cert, db):
        db.commit()
        db.refresh(cert)

    base = CertificateResponse.model_validate(cert).model_dump()
    return CertificateVerifyResponse(
        **base,
        verified=True,
        verification_url=f"/verify/{cert.credential_id}",
        platform="Coding Task Factory",
    )


@router.get("/certificates/{credential_id}/pdf")
def download_certificate_pdf(credential_id: str, db: Session = Depends(get_db)):
    cert = (
        db.query(Certificate)
        .filter((Certificate.credential_id == credential_id) | (Certificate.id == credential_id))
        .first()
    )
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate credential not found")
    if _ensure_cert_enriched(cert, db):
        db.commit()
        db.refresh(cert)

    cert_data = CertificateResponse.model_validate(cert).model_dump()
    pdf_bytes = generate_certificate_pdf(cert_data)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="CodingTaskFactory-{cert.credential_id}.pdf"'
        },
    )
