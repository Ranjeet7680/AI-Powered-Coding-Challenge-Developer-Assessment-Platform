import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Challenge, Submission
from ..schemas import RunCodeRequest, RunCodeResponse, SubmitCodeRequest, SubmissionResponse
from ..services.code_runner import execute_code
from ..services.gemini_service import generate_ai_code_review
from .auth import get_current_user
from .submissions import to_submission_response

router = APIRouter(prefix="/api", tags=["Code Execution"])

@router.post("/run-code", response_model=RunCodeResponse)
def run_code(
    payload: RunCodeRequest,
    _user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    test_cases = [tc.dict() for tc in payload.test_cases]
    if not test_cases and payload.custom_input is not None:
        test_cases = [{"input": payload.custom_input, "expected_output": "", "is_hidden": False}]
    
    # If test cases still empty and challenge_id provided, fetch challenge test cases
    if not test_cases and payload.challenge_id:
        c = db.query(Challenge).filter(Challenge.id == payload.challenge_id).first()
        if c and c.test_cases:
            # Use public test cases for run-code
            test_cases = [tc for tc in c.test_cases if not tc.get("is_hidden", False)]
    
    res = execute_code(payload.language, payload.code, test_cases)
    return RunCodeResponse(**res)

@router.post("/submit-solution", response_model=SubmissionResponse)
def submit_solution(
    payload: SubmitCodeRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    challenge = db.query(Challenge).filter(Challenge.id == payload.challenge_id).first()
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")
    
    # Run against all test cases (both public and hidden)
    all_test_cases = challenge.test_cases or []
    exec_result = execute_code(payload.language, payload.code, all_test_cases)

    # Generate AI code review
    ai_feedback = generate_ai_code_review(
        code=payload.code,
        language=payload.language,
        status=exec_result["status"],
        runtime_ms=exec_result["runtime_ms"],
        memory_mb=exec_result["memory_mb"],
        api_key=payload.api_key or user.gemini_api_key
    )

    total_count = exec_result["total_count"]
    passed_count = exec_result["passed_count"]
    passed_all = total_count > 0 and passed_count == total_count
    score = 100 if passed_all else int((passed_count / max(1, total_count)) * 100)

    # Award points & update streak only on first Accepted solution for this challenge
    if passed_all:
        already_solved = (
            db.query(Submission.id)
            .filter(
                Submission.user_id == user.id,
                Submission.challenge_id == challenge.id,
                Submission.status == "Accepted",
            )
            .first()
            is not None
        )
        if not already_solved:
            user.points += 50
            user.solved_count += 1
            user.streak = max(user.streak, 1) + 1

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
        test_cases_passed=passed_count,
        total_test_cases=total_count,
        test_results=exec_result["test_results"],
        ai_feedback=ai_feedback,
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)

    return to_submission_response(submission, challenge.title)
