from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import User, Submission, Challenge
from ..schemas import SubmissionResponse
from .auth import get_current_user

router = APIRouter(prefix="/api/submissions", tags=["Submissions"])


def _to_submission_response(s: Submission, title: str) -> SubmissionResponse:
    return SubmissionResponse(
        id=s.id,
        user_id=s.user_id,
        challenge_id=s.challenge_id,
        challenge_title=title,
        language=s.language,
        code=s.code,
        status=s.status,
        runtime_ms=s.runtime_ms,
        memory_mb=s.memory_mb,
        score=s.score,
        test_cases_passed=s.test_cases_passed,
        total_test_cases=s.total_test_cases,
        test_results=s.test_results or [],
        ai_feedback=s.ai_feedback or {},
        created_at=s.created_at,
    )


@router.get("", response_model=List[SubmissionResponse])
def get_user_submissions(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    submissions = (
        db.query(Submission)
        .filter(Submission.user_id == user.id)
        .order_by(Submission.created_at.desc())
        .all()
    )
    if not submissions:
        return []

    challenge_ids = {s.challenge_id for s in submissions}
    challenges = db.query(Challenge).filter(Challenge.id.in_(challenge_ids)).all()
    title_map = {c.id: c.title for c in challenges}

    return [_to_submission_response(s, title_map.get(s.challenge_id, "Custom Challenge")) for s in submissions]


@router.get("/{submission_id}", response_model=SubmissionResponse)
def get_submission_detail(
    submission_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    s = (
        db.query(Submission)
        .filter(Submission.id == submission_id, Submission.user_id == user.id)
        .first()
    )
    if not s:
        raise HTTPException(status_code=404, detail="Submission not found")
    ch = db.query(Challenge).filter(Challenge.id == s.challenge_id).first()
    return _to_submission_response(s, ch.title if ch else "Custom Challenge")
