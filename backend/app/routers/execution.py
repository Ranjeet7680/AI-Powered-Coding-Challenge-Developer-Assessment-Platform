import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Challenge, Submission
from ..schemas import RunCodeRequest, RunCodeResponse, SubmitCodeRequest, SubmissionResponse
from ..services.code_runner import execute_code
from ..services.gemini_service import generate_ai_code_review
from .auth import get_current_user

router = APIRouter(prefix="/api", tags=["Code Execution"])


@router.post("/run-code", response_model=RunCodeResponse)
def run_code(
    payload: RunCodeRequest,
    _user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    test_cases = [tc.model_dump() for tc in payload.test_cases]
    time_limit_sec = 3.0

    if payload.challenge_id:
        c = db.query(Challenge).filter(Challenge.id == payload.challenge_id).first()
        if c:
            time_limit_sec = max(1.0, (c.time_limit_ms or 3000) / 1000.0)
            if not test_cases and payload.custom_input is None and c.test_cases:
                test_cases = [tc for tc in c.test_cases if not tc.get("is_hidden", False)]

    if not test_cases and payload.custom_input is not None:
        test_cases = [{"input": payload.custom_input, "expected_output": "", "is_hidden": False}]

    res = execute_code(payload.language, payload.code, test_cases, time_limit_sec=time_limit_sec)
    return RunCodeResponse(**res)


@router.post("/submit-solution", response_model=SubmissionResponse)
def submit_solution(
    payload: SubmitCodeRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    challenge = db.query(Challenge).filter(Challenge.id == payload.challenge_id).first()
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")

    all_test_cases = challenge.test_cases or []
    time_limit_sec = max(1.0, (challenge.time_limit_ms or 3000) / 1000.0)
    exec_result = execute_code(payload.language, payload.code, all_test_cases, time_limit_sec=time_limit_sec)

    ai_feedback = generate_ai_code_review(
        code=payload.code,
        language=payload.language,
        status=exec_result["status"],
        runtime_ms=exec_result["runtime_ms"],
        memory_mb=exec_result["memory_mb"],
        api_key=payload.api_key or user.gemini_api_key,
    )

    passed_all = exec_result["passed_count"] == exec_result["total_count"] and exec_result["total_count"] > 0
    score = 100 if passed_all else int((exec_result["passed_count"] / max(1, exec_result["total_count"])) * 100)

    # Check if user already solved this challenge before awarding full first-solve points
    prior_accepted = (
        db.query(Submission)
        .filter(
            Submission.user_id == user.id,
            Submission.challenge_id == challenge.id,
            Submission.status == "Accepted",
        )
        .first()
    )

    if passed_all:
        if not prior_accepted:
            user.points += 50
            user.solved_count += 1
            user.streak = max(user.streak, 1) + 1
        else:
            user.points += 10

    # Update challenge statistics
    prev_total = challenge.total_submissions or 0
    prev_accepted_est = (challenge.acceptance_rate or 0.0) / 100.0 * prev_total
    new_total = prev_total + 1
    new_accepted = prev_accepted_est + (1.0 if passed_all else 0.0)
    challenge.total_submissions = new_total
    challenge.acceptance_rate = round((new_accepted / new_total) * 100.0, 1)

    submission = Submission(
        id=str(uuid.uuid4()),
        user_id=user.id,
        challenge_id=challenge.id,
        language=payload.language,
        code=payload.code,
        status=exec_result["status"],
        runtime_ms=exec_result["runtime_ms"],
        memory_mb=exec_result["memory_mb"],
        score=score,
        test_cases_passed=exec_result["passed_count"],
        total_test_cases=exec_result["total_count"],
        test_results=exec_result["test_results"],
        ai_feedback=ai_feedback,
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)

    return SubmissionResponse(
        id=submission.id,
        user_id=submission.user_id,
        challenge_id=submission.challenge_id,
        challenge_title=challenge.title,
        language=submission.language,
        code=submission.code,
        status=submission.status,
        runtime_ms=submission.runtime_ms,
        memory_mb=submission.memory_mb,
        score=submission.score,
        test_cases_passed=submission.test_cases_passed,
        total_test_cases=submission.total_test_cases,
        test_results=submission.test_results,
        ai_feedback=submission.ai_feedback,
        created_at=submission.created_at,
    )
