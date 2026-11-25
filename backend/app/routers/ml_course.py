"""
Machine Learning Full LMS Router:
- Serves all 106 playlist lessons, 7 modules, Markdown notes & Python snippets
- Handles per-lesson completion tracking (+15 XP) and personal saved notes
- Grades 106 after-video comprehension quizzes & 100+ quiz mastery practice
- Administers and grades the Proctored Final Exam (Camera Cheat-Protection telemetry)
  and issues a verified Certificate ready for Vector PDF & Social Share.
"""
import datetime
import uuid
from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Certificate, MLCourseProgress, User
from ..schemas import (
    CertificateResponse,
    MLFinalExamResultResponse,
    MLFinalExamSubmitRequest,
    MLLessonNoteUpdate,
    MLPracticeQuizResultResponse,
    MLPracticeQuizSubmitRequest,
    MLQuizAnswerRequest,
    MLQuizAnswerResponse,
)
from ..services.ml_course_catalog import (
    COURSE_TITLE,
    get_100_quiz_bank,
    get_final_exam_questions,
    get_lesson_by_id,
    get_ml_course_catalog,
)
from ..services.pdf_certificate import compute_credential_hash, default_certificate_metadata
from .auth import get_current_user, get_optional_user

router = APIRouter(prefix="/api/ml-course", tags=["ML Course LMS"])


def _get_or_create_progress(user_id: str, db: Session) -> MLCourseProgress:
    prog = db.query(MLCourseProgress).filter(MLCourseProgress.user_id == user_id).first()
    if not prog:
        prog = MLCourseProgress(
            id=str(uuid.uuid4()),
            user_id=user_id,
            completed_lessons=[],
            lesson_notes={},
            quiz_results={},
            practice_quiz_best_score=0,
            final_exam_passed=False,
            final_exam_violations=0,
            final_exam_log=[],
        )
        db.add(prog)
        db.commit()
        db.refresh(prog)
    return prog


def _serialize_progress(prog: MLCourseProgress) -> Dict[str, Any]:
    return {
        "completed_lessons": list(prog.completed_lessons or []),
        "lesson_notes": dict(prog.lesson_notes or {}),
        "quiz_results": dict(prog.quiz_results or {}),
        "practice_quiz_best_score": prog.practice_quiz_best_score or 0,
        "final_exam_score": prog.final_exam_score,
        "final_exam_passed": bool(prog.final_exam_passed),
        "final_exam_violations": prog.final_exam_violations or 0,
    }


@router.get("")
def get_ml_course_overview(
    user: User = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    catalog = get_ml_course_catalog()
    progress_data = None
    if user:
        prog = _get_or_create_progress(user.id, db)
        progress_data = _serialize_progress(prog)

    return {
        "id": catalog["id"],
        "title": catalog["title"],
        "playlist_id": catalog["playlist_id"],
        "playlist_url": catalog["playlist_url"],
        "instructor": catalog["instructor"],
        "total_lessons": catalog["total_lessons"],
        "total_quizzes": catalog["total_quizzes"],
        "modules": catalog["modules"],
        "lessons": catalog["lessons"],
        "progress": progress_data,
    }


@router.get("/lessons/{lesson_id}")
def get_ml_lesson(lesson_id: str):
    lesson = get_lesson_by_id(lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="ML lesson not found")
    return lesson


@router.post("/lessons/{lesson_id}/complete")
def complete_ml_lesson(
    lesson_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    lesson = get_lesson_by_id(lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="ML lesson not found")

    prog = _get_or_create_progress(user.id, db)
    completed = list(prog.completed_lessons or [])
    awarded = 0
    if lesson["id"] not in completed:
        completed.append(lesson["id"])
        prog.completed_lessons = completed
        awarded = 15
        user.points = (user.points or 0) + awarded
        db.commit()
        db.refresh(prog)

    return {
        "lesson_id": lesson["id"],
        "completed_lessons": list(prog.completed_lessons or []),
        "points_awarded": awarded,
        "total_points": user.points,
    }


@router.put("/lessons/{lesson_id}/notes")
def save_ml_lesson_notes(
    lesson_id: str,
    payload: MLLessonNoteUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    lesson = get_lesson_by_id(lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="ML lesson not found")

    prog = _get_or_create_progress(user.id, db)
    notes_map = dict(prog.lesson_notes or {})
    notes_map[lesson["id"]] = payload.notes
    prog.lesson_notes = notes_map
    db.commit()
    return {"lesson_id": lesson["id"], "saved": True, "lesson_notes": notes_map}


@router.post("/lessons/{lesson_id}/quiz", response_model=MLQuizAnswerResponse)
def submit_ml_lesson_quiz(
    lesson_id: str,
    payload: MLQuizAnswerRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    lesson = get_lesson_by_id(lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="ML lesson not found")

    quiz = lesson["quiz"]
    correct_idx = int(quiz["correct_index"])
    is_correct = payload.selected_index == correct_idx

    prog = _get_or_create_progress(user.id, db)
    q_map = dict(prog.quiz_results or {})
    prev = q_map.get(lesson["id"], {})
    was_already_correct = bool(prev.get("correct", False))
    attempts = int(prev.get("attempts", 0)) + 1

    q_map[lesson["id"]] = {
        "selected": payload.selected_index,
        "correct": is_correct or was_already_correct,
        "last_correct": is_correct,
        "attempts": attempts,
    }
    prog.quiz_results = q_map

    # Mark lesson completed automatically when user answers its quiz right
    completed = list(prog.completed_lessons or [])
    if is_correct and lesson["id"] not in completed:
        completed.append(lesson["id"])
        prog.completed_lessons = completed

    awarded = 0
    if is_correct and not was_already_correct:
        awarded = 10
        user.points = (user.points or 0) + awarded

    db.commit()
    return MLQuizAnswerResponse(
        lesson_id=lesson["id"],
        quiz_id=quiz["id"],
        correct=is_correct,
        correct_index=correct_idx,
        explanation=quiz["explanation"],
        points_awarded=awarded,
    )


@router.get("/quiz-bank")
def get_ml_quiz_bank():
    questions = get_100_quiz_bank(include_answers=False)
    return {
        "total": len(questions),
        "questions": questions,
    }


@router.post("/quiz-bank/submit", response_model=MLPracticeQuizResultResponse)
def submit_ml_quiz_bank(
    payload: MLPracticeQuizSubmitRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    bank = get_100_quiz_bank(include_answers=True)
    by_id = {q["id"]: q for q in bank}

    correct_count = 0
    details = []
    prog = _get_or_create_progress(user.id, db)
    q_map = dict(prog.quiz_results or {})

    for qid, selected in payload.answers.items():
        q = by_id.get(qid)
        if not q:
            continue
        is_ok = selected == q["correct_index"]
        if is_ok:
            correct_count += 1
        lesson_id = q["lesson_id"]
        prev = q_map.get(lesson_id, {})
        q_map[lesson_id] = {
            "selected": selected,
            "correct": bool(prev.get("correct", False)) or is_ok,
            "last_correct": is_ok,
            "attempts": int(prev.get("attempts", 0)) + 1,
        }
        details.append(
            {
                "quiz_id": qid,
                "lesson_id": lesson_id,
                "selected": selected,
                "correct_index": q["correct_index"],
                "correct": is_ok,
                "explanation": q["explanation"],
            }
        )

    total_answered = len(details)
    denom = max(total_answered, 1)
    score_pct = round((correct_count / denom) * 100)

    prog.quiz_results = q_map
    if total_answered >= 5 and score_pct > (prog.practice_quiz_best_score or 0):
        prog.practice_quiz_best_score = score_pct
    if correct_count > 0:
        user.points = (user.points or 0) + min(150, correct_count * 2)

    db.commit()
    return MLPracticeQuizResultResponse(
        total_answered=total_answered,
        total_questions=len(bank),
        correct_count=correct_count,
        score_percent=score_pct,
        best_score=prog.practice_quiz_best_score or score_pct,
        details=details,
    )


@router.get("/final-exam")
def get_ml_final_exam(user: User = Depends(get_current_user)):
    questions = get_final_exam_questions(include_answers=False)
    return {
        "exam_id": "ml-proctored-final-exam",
        "title": "Machine Learning Mastery — Proctored Final Exam",
        "total_questions": len(questions),
        "duration_minutes": 45,
        "passing_score": 70,
        "max_violations_allowed": 2,
        "proctoring_required": True,
        "candidate": user.full_name,
        "questions": questions,
    }


@router.post("/final-exam/submit", response_model=MLFinalExamResultResponse)
def submit_ml_final_exam(
    payload: MLFinalExamSubmitRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    questions = get_final_exam_questions(include_answers=True)
    correct_count = 0
    for q in questions:
        qid = q["id"]
        if qid in payload.answers and payload.answers[qid] == q["correct_index"]:
            correct_count += 1

    total_q = len(questions)
    score_pct = round((correct_count / max(total_q, 1)) * 100)
    disqualified = payload.auto_terminated or payload.violations >= 3
    passed = (not disqualified) and score_pct >= 70 and payload.camera_verified

    prog = _get_or_create_progress(user.id, db)
    prog.final_exam_score = score_pct
    prog.final_exam_violations = payload.violations
    prog.final_exam_log = payload.violation_log[-25:]
    if passed:
        prog.final_exam_passed = True

    cert_resp = None
    if passed:
        user.points = (user.points or 0) + 300
        existing_cert = (
            db.query(Certificate)
            .filter(Certificate.user_id == user.id, Certificate.title == COURSE_TITLE)
            .first()
        )
        if not existing_cert:
            cred_id = f"CTF-ML-{uuid.uuid4().hex[:6].upper()}"
            issue_dt = datetime.datetime.utcnow()
            meta = default_certificate_metadata(
                COURSE_TITLE,
                "Applied AI Engineering",
                score_pct,
                106,
                32,
            )
            cert = Certificate(
                id=str(uuid.uuid4()),
                user_id=user.id,
                title=COURSE_TITLE,
                recipient_name=user.full_name,
                issue_date=issue_dt,
                credential_id=cred_id,
                badge_icon="BrainCircuit",
                category="Applied AI Engineering",
                grade=f"Proctored Distinction ({score_pct}%)" if score_pct >= 85 else f"Proctored Pass ({score_pct}%)",
                issuer_name=meta["issuer_name"],
                signatory_name=meta["signatory_name"],
                signatory_title=meta["signatory_title"],
                score_percent=score_pct,
                skills_verified=[
                    "Regression & Regularization",
                    "PCA, Clustering & Trees",
                    "Gradient Boosting & XGBoost",
                    "Neural Nets, CNNs & Transformers",
                    "PyTorch, RL & RLHF",
                ],
                challenges_completed=106,
                completion_hours=32,
                summary=(
                    f"Awarded after completing the 106-lecture Machine Learning LMS curriculum and passing "
                    f"the camera-proctored final examination ({score_pct}% score, {payload.violations} proctoring alerts)."
                ),
                credential_hash=compute_credential_hash(
                    cred_id,
                    user.full_name,
                    COURSE_TITLE,
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

    if disqualified:
        msg = "Exam disqualified due to 3 or more anti-cheat / camera proctoring violations."
    elif not payload.camera_verified:
        msg = "Camera verification was not active during the exam submission."
    elif passed:
        msg = f"Congratulations! You passed the Proctored ML Final Exam with {score_pct}% and earned your verified certificate."
    else:
        msg = f"Scored {score_pct}% (70% passing required). Review your notes & quizzes and retry the exam."

    return MLFinalExamResultResponse(
        score_percent=score_pct,
        correct_count=correct_count,
        total_questions=total_q,
        passed=passed,
        disqualified=disqualified,
        violations=payload.violations,
        message=msg,
        certificate=cert_resp,
    )
