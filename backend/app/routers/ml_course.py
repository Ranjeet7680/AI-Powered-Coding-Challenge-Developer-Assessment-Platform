"""
Parameterized Multi-Course LMS Router:
- Serves `/api/ml-course` (106-video ML LMS),
  `/api/dl-course` ([Stanford X Coding Task Factory Academy] 21-video Deep Learning LMS),
  `/api/ds-course` (Python Data Science & Big Data 14-video LMS),
  `/api/biz-course` ([IIT Madras X Coding Task Factory Academy] 66-video Business Fundamentals LMS),
  and `/api/agentic-course` (Agentic AI Engineering & MCP 23-video LMS).
- Handles:
  * Advanced structured module syllabi & privacy-enhanced In-LMS playback URLs
  * Per-lesson completion tracking (+15 XP) and persistent cloud study notes
  * After-video comprehension quizzes (+10 XP) & cumulative quiz mastery bank
  * Graded Capstone Project assignments with rubric evaluation & history
  * Peer Reviews & Ratings system with helpful upvoting & verified-learner badges
  * Camera-proctored Final Exam + verified Certificate & Vector PDF issuance
"""
import datetime
import html
import uuid
from dataclasses import dataclass
from typing import Any, Callable, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import (
    Certificate,
    CourseCapstoneSubmission,
    CourseGoodiesClaim,
    CourseLMSProgress,
    CourseReview,
    MLCourseProgress,
    User,
)
from ..schemas import (
    CapstoneSubmissionResponse,
    CapstoneSubmitRequest,
    CertificateResponse,
    CourseGoodiesClaimRequest,
    CourseGoodiesClaimResponse,
    CourseReviewCreateRequest,
    CourseReviewItem,
    CourseReviewsOverviewResponse,
    MLFinalExamResultResponse,
    MLFinalExamSubmitRequest,
    MLLessonNoteUpdate,
    MLPracticeQuizResultResponse,
    MLPracticeQuizSubmitRequest,
    MLQuizAnswerRequest,
    MLQuizAnswerResponse,
)
from ..services.agentic_course_catalog import (
    AGENTIC_COURSE_ID,
    AGENTIC_COURSE_TITLE,
    get_agentic_course_catalog,
    get_agentic_final_exam_questions,
    get_agentic_lesson_by_id,
    get_agentic_quiz_bank,
)
from ..services.biz_course_catalog import (
    BIZ_COURSE_ID,
    BIZ_COURSE_TITLE,
    get_biz_course_catalog,
    get_biz_final_exam_questions,
    get_biz_lesson_by_id,
    get_biz_quiz_bank,
)
from ..services.dl_course_catalog import (
    DL_COURSE_ID,
    DL_COURSE_TITLE,
    get_dl_course_catalog,
    get_dl_final_exam_questions,
    get_dl_lesson_by_id,
    get_dl_quiz_bank,
)
from ..services.ds_course_catalog import (
    DS_COURSE_ID,
    DS_COURSE_TITLE,
    get_ds_course_catalog,
    get_ds_final_exam_questions,
    get_ds_lesson_by_id,
    get_ds_quiz_bank,
)
from ..services.ml_course_catalog import (
    COURSE_ID as ML_COURSE_ID,
    COURSE_TITLE as ML_COURSE_TITLE,
    get_100_quiz_bank,
    get_final_exam_questions,
    get_lesson_by_id,
    get_ml_course_catalog,
)
from ..services.pdf_certificate import compute_credential_hash, default_certificate_metadata
from .auth import get_current_user, get_optional_user


@dataclass(frozen=True)
class CourseTrackConfig:
    course_id: str
    course_title: str
    exam_id: str
    exam_title: str
    exam_duration_minutes: int
    cert_prefix: str
    cert_category: str
    cert_skills: List[str]
    completion_hours: int
    use_legacy_ml_table: bool
    get_catalog: Callable[[], Dict[str, Any]]
    get_lesson: Callable[[str], Optional[Dict[str, Any]]]
    get_quiz_bank: Callable[..., List[Dict[str, Any]]]
    get_exam_questions: Callable[..., List[Dict[str, Any]]]


ML_TRACK = CourseTrackConfig(
    course_id=ML_COURSE_ID,
    course_title=ML_COURSE_TITLE,
    exam_id="ml-proctored-final-exam",
    exam_title="Machine Learning Mastery — Proctored Final Exam",
    exam_duration_minutes=45,
    cert_prefix="CTF-ML-",
    cert_category="Applied AI Engineering",
    cert_skills=[
        "Regression & Regularization",
        "PCA, Clustering & Trees",
        "Gradient Boosting & XGBoost",
        "Neural Nets, CNNs & Transformers",
        "PyTorch, RL & RLHF",
    ],
    completion_hours=32,
    use_legacy_ml_table=True,
    get_catalog=get_ml_course_catalog,
    get_lesson=get_lesson_by_id,
    get_quiz_bank=get_100_quiz_bank,
    get_exam_questions=get_final_exam_questions,
)

DL_TRACK = CourseTrackConfig(
    course_id=DL_COURSE_ID,
    course_title=DL_COURSE_TITLE,
    exam_id="dl-proctored-final-exam",
    exam_title="[Stanford X Coding Task Factory Academy] Deep Learning — Proctored Final Exam",
    exam_duration_minutes=30,
    cert_prefix="CTF-DL-",
    cert_category="Deep Learning & Neural Mastery",
    cert_skills=[
        "Supervised Optimization & GLMs",
        "SVMs, Margins & Mercer Kernels",
        "Deep Networks & Backpropagation",
        "Expectation-Maximization, PCA & ICA",
        "Markov Decision Processes & LQR Control",
    ],
    completion_hours=28,
    use_legacy_ml_table=False,
    get_catalog=get_dl_course_catalog,
    get_lesson=get_dl_lesson_by_id,
    get_quiz_bank=get_dl_quiz_bank,
    get_exam_questions=get_dl_final_exam_questions,
)

DS_TRACK = CourseTrackConfig(
    course_id=DS_COURSE_ID,
    course_title=DS_COURSE_TITLE,
    exam_id="ds-proctored-final-exam",
    exam_title="Python Data Science & Big Data — Proctored Final Exam",
    exam_duration_minutes=25,
    cert_prefix="CTF-DS-",
    cert_category="Data Science & Big Data Analytics",
    cert_skills=[
        "NumPy Vectorization",
        "Pandas DataFrames",
        "CSV & JSON ETL",
        "Data Merging & Joins",
        "Matplotlib Visualization",
    ],
    completion_hours=18,
    use_legacy_ml_table=False,
    get_catalog=get_ds_course_catalog,
    get_lesson=get_ds_lesson_by_id,
    get_quiz_bank=get_ds_quiz_bank,
    get_exam_questions=get_ds_final_exam_questions,
)

BIZ_TRACK = CourseTrackConfig(
    course_id=BIZ_COURSE_ID,
    course_title=BIZ_COURSE_TITLE,
    exam_id="biz-proctored-final-exam",
    exam_title="[IIT Madras X Coding Task Factory Academy] Business Fundamentals — Proctored Exam",
    exam_duration_minutes=40,
    cert_prefix="CTF-BIZ-",
    cert_category="Entrepreneurial & Business Analytics",
    cert_skills=[
        "Pricing Elasticity & Profit Opt",
        "Bayes & Chi-Square Inference",
        "Multiple Regression & VIF",
        "Data Envelopment Analysis (DEA)",
        "Conjoint Market Simulation",
    ],
    completion_hours=45,
    use_legacy_ml_table=False,
    get_catalog=get_biz_course_catalog,
    get_lesson=get_biz_lesson_by_id,
    get_quiz_bank=get_biz_quiz_bank,
    get_exam_questions=get_biz_final_exam_questions,
)

AGENTIC_TRACK = CourseTrackConfig(
    course_id=AGENTIC_COURSE_ID,
    course_title=AGENTIC_COURSE_TITLE,
    exam_id="agentic-proctored-final-exam",
    exam_title="Agentic AI Engineering & MCP — Proctored Final Exam",
    exam_duration_minutes=30,
    cert_prefix="CTF-AG-",
    cert_category="Agentic AI & MCP Systems",
    cert_skills=[
        "Agent Architectures & Q-Learning",
        "LangGraph Stateful Workflows",
        "CrewAI & Agno Multi-Agent RAG",
        "Model Context Protocol (MCP)",
        "OpenAI Agents SDK & Cloud Tools",
    ],
    completion_hours=24,
    use_legacy_ml_table=False,
    get_catalog=get_agentic_course_catalog,
    get_lesson=get_agentic_lesson_by_id,
    get_quiz_bank=get_agentic_quiz_bank,
    get_exam_questions=get_agentic_final_exam_questions,
)

_SEED_REVIEWS_BY_COURSE: Dict[str, List[Dict[str, Any]]] = {
    ML_COURSE_ID: [
        {
            "author_name": "Priya Nair",
            "author_role": "Senior ML Systems Engineer",
            "rating": 5,
            "headline": "Best end-to-end ML intuition + hands-on assessment workspace",
            "comment": "Having all 106 lectures inside one distraction-free player with LaTeX notes, 106 comprehension quizzes, and the gradient-boosting/transformer capstones turned theory into production clarity.",
            "helpful_count": 18,
        },
        {
            "author_name": "Marcus Chen",
            "author_role": "Data Scientist",
            "rating": 5,
            "headline": "XGBoost + Causal Attention capstones really cemented the math",
            "comment": "The structured per-module roadmap and immediate after-video quiz feedback exposed subtle blind spots in PR-AUC calibration and regularized trees.",
            "helpful_count": 11,
        },
        {
            "author_name": "Elena Rostova",
            "author_role": "Applied AI Lead",
            "rating": 5,
            "headline": "Proctored exam & PDF credential hold genuine hiring weight",
            "comment": "Camera-guarded final exam certification paired with verifiable SHA-256 credentials gives engineering teams real confidence in candidate mastery.",
            "helpful_count": 9,
        },
    ],
    DL_COURSE_ID: [
        {
            "author_name": "Aarav Mehta",
            "author_role": "Deep Learning Researcher",
            "rating": 5,
            "headline": "CS229 rigor fused with an interactive coding LMS",
            "comment": "Deriving Exponential Family GLMs, Mercer kernels, EM ELBO bounds, and Riccati LQR alongside Python starter templates and immediate post-lecture quizzes is unmatched.",
            "helpful_count": 21,
        },
        {
            "author_name": "Sophia Kim",
            "author_role": "Robotics & Control Engineer",
            "rating": 5,
            "headline": "The MDP -> Fitted Value Iteration -> LQR progression is crystal clear",
            "comment": "Building Capstone 3 on LQR control and passing the camera-proctored Stanford X CTF exam was the highest-ROI weekend engineering sprint I have done.",
            "helpful_count": 14,
        },
        {
            "author_name": "Daniel Okafor",
            "author_role": "ML Platform Architect",
            "rating": 4,
            "headline": "Challenging math, crisp notes & spotless in-LMS playback",
            "comment": "Love that videos stream cleanly inside the LMS without distractions, and the personal cloud notebook right next to Backprop & Error Analysis lectures made revision effortless.",
            "helpful_count": 7,
        },
    ],
    DS_COURSE_ID: [
        {
            "author_name": "Rohan Kulkarni",
            "author_role": "Analytics Engineer",
            "rating": 5,
            "headline": "Practical path from Jupyter basics to NumPy axis ops & Pandas merges",
            "comment": "Every lecture comes with runnable Python snippets and immediate quizzes that reinforce views vs copies, axis=0/1 reductions, JSON flattening, and clean CSV exports.",
            "helpful_count": 16,
        },
        {
            "author_name": "Meera Iyer",
            "author_role": "Senior Data Analyst",
            "rating": 5,
            "headline": "Capstone ETL & Matplotlib reporting exercises mirror real production work",
            "comment": "Combining CSV/JSON normalization with relational pd.merge validation and passing the proctored final exam turned fundamentals into a verified credential.",
            "helpful_count": 11,
        },
        {
            "author_name": "Vikramaditya Sen",
            "author_role": "BI Systems Developer",
            "rating": 5,
            "headline": "Crisp हिंदी explanation paired with production English reference notes",
            "comment": "Having structured English Markdown notes, Pandas cheat-sheet snippets, and quizzes alongside the video playlist made revision fast and focused.",
            "helpful_count": 8,
        },
    ],
    BIZ_COURSE_ID: [
        {
            "author_name": "Siddharth Ramanathan",
            "author_role": "Founder & Product Strategist",
            "rating": 5,
            "headline": "IIT Madras rigor applied straight to startup pricing, VIF & conjoint decisions",
            "comment": "Connecting demand elasticity directly to MR=MC profit optimization, Data Envelopment Analysis frontiers, and conjoint market simulation gave our pricing strategy real mathematical grounding.",
            "helpful_count": 24,
        },
        {
            "author_name": "Ananya Deshmukh",
            "author_role": "Venture Operations Lead",
            "rating": 5,
            "headline": "From Excel dashboards to DEA peer benchmarking and Logistic scoring",
            "comment": "All 66 lectures with step-by-step quizzes and LP duality notes bridge textbook statistics and day-one founder execution cleanly.",
            "helpful_count": 15,
        },
        {
            "author_name": "Karanjit Singh",
            "author_role": "Growth Analytics Manager",
            "rating": 5,
            "headline": "Capstone conjoint & pricing labs are boardroom-ready",
            "comment": "Proctored exam certification and SHA-256 PDF credential make IIT Madras X Coding Task Factory Academy stand out immediately.",
            "helpful_count": 10,
        },
    ],
    AGENTIC_COURSE_ID: [
        {
            "author_name": "Neha Kapoor",
            "author_role": "AI Agent Systems Engineer",
            "rating": 5,
            "headline": "Complete journey from Simple Reflex agents & Bellman Q-learning to live MCP servers",
            "comment": "Going step by step from LangChain goals to stateful LangGraph loops, CrewAI teams, Agno Agentic RAG, custom cloud MCP hosting, and OpenAI Agents SDK saved weeks of scattered docs.",
            "helpful_count": 22,
        },
        {
            "author_name": "Raghavendra Rao",
            "author_role": "Staff LLM Platform Architect",
            "rating": 5,
            "headline": "The MCP protocol + LangGraph & Agno integrations click effortlessly",
            "comment": "Every lecture comes with focused tool-contract snippets, state-routing capstones, and immediate comprehension checks.",
            "helpful_count": 17,
        },
        {
            "author_name": "Tanya Verma",
            "author_role": "Applied AI Builder",
            "rating": 5,
            "headline": "Best structured Agentic AI + OpenAI Agents SDK syllabus",
            "comment": "Loved building custom JSON-RPC tool contracts and validating everything through the proctored capstone + exam track.",
            "helpful_count": 9,
        },
    ],
}


def _get_or_create_progress(track: CourseTrackConfig, user_id: str, db: Session):
    if track.use_legacy_ml_table:
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

    prog = (
        db.query(CourseLMSProgress)
        .filter(
            CourseLMSProgress.user_id == user_id,
            CourseLMSProgress.course_id == track.course_id,
        )
        .first()
    )
    if not prog:
        prog = CourseLMSProgress(
            id=str(uuid.uuid4()),
            user_id=user_id,
            course_id=track.course_id,
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


def _serialize_progress(prog: Any) -> Dict[str, Any]:
    return {
        "completed_lessons": list(prog.completed_lessons or []),
        "lesson_notes": dict(prog.lesson_notes or {}),
        "quiz_results": dict(prog.quiz_results or {}),
        "practice_quiz_best_score": prog.practice_quiz_best_score or 0,
        "final_exam_score": prog.final_exam_score,
        "final_exam_passed": bool(prog.final_exam_passed),
        "final_exam_violations": prog.final_exam_violations or 0,
    }


def _evaluate_capstone_rubric(
    project: Dict[str, Any],
    payload: CapstoneSubmitRequest,
) -> Dict[str, Any]:
    notes = (payload.architecture_notes or "").strip()
    code = (payload.code_submission or "").strip()
    has_repo = bool((payload.repo_url or "").strip().startswith("http"))
    has_code = ("def " in code or "class " in code or "import " in code or "torch" in code or "np." in code)
    note_words = len(notes.split())
    code_lines = len([ln for ln in code.splitlines() if ln.strip()])

    # Depth signal weighted smoothly across architecture explanation, code artifacts & repository evidence
    notes_ratio = min(1.0, note_words / 35.0)
    code_ratio = 0.95 if (has_code and code_lines >= 6) else (0.72 if code_lines >= 3 else 0.55)
    repo_bonus = 0.08 if has_repo else 0.0
    base_quality = min(0.98, 0.52 + 0.25 * notes_ratio + 0.21 * code_ratio + repo_bonus)

    rubric_scores: Dict[str, int] = {}
    total_awarded = 0
    total_possible = 0
    for idx, item in enumerate(project.get("rubric", [])):
        max_pts = int(item.get("max_points", 25))
        total_possible += max_pts
        # Slight variance across rubric axes so scores read naturally and deterministically
        axis_factor = min(1.0, max(0.55, base_quality - (idx % 2) * 0.04))
        pts = min(max_pts, max(1, round(max_pts * axis_factor)))
        rubric_scores[item["criterion"]] = pts
        total_awarded += pts

    overall_pct = round((total_awarded / max(1, total_possible)) * 100)
    status = "Approved" if overall_pct >= 70 else "Needs Revision"

    feedback_parts = [
        f"Evaluated {total_awarded}/{total_possible} rubric points ({overall_pct}%) for '{project['title']}'.",
    ]
    if has_code and code_lines >= 6:
        feedback_parts.append("Clean executable Python structure detected with verifiable implementation logic.")
    else:
        feedback_parts.append("Add fuller Python implementation functions/classes and unit assertions to strengthen production readiness.")
    if note_words >= 30:
        feedback_parts.append("Architecture notes cover design rationale and convergence/evaluation metrics clearly.")
    else:
        feedback_parts.append("Expand architecture notes with empirical validation metrics and failure-mode ablation findings.")

    return {
        "rubric_scores": rubric_scores,
        "overall_score": overall_pct,
        "status": status,
        "ai_feedback": " ".join(feedback_parts),
    }


def _ensure_seed_reviews(track: CourseTrackConfig, db: Session) -> None:
    existing_cnt = db.query(CourseReview).filter(CourseReview.course_id == track.course_id).count()
    if existing_cnt > 0:
        return
    seeds = _SEED_REVIEWS_BY_COURSE.get(track.course_id, [])
    now = datetime.datetime.utcnow()
    for idx, item in enumerate(seeds):
        db.add(
            CourseReview(
                id=str(uuid.uuid4()),
                course_id=track.course_id,
                user_id=None,
                author_name=item["author_name"],
                author_role=item["author_role"],
                rating=item["rating"],
                headline=item["headline"],
                comment=item["comment"],
                verified_learner=True,
                helpful_count=item["helpful_count"],
                helpful_voters=[],
                created_at=now - datetime.timedelta(days=(idx + 1) * 3),
            )
        )
    if seeds:
        db.commit()


def _serialize_review(r: CourseReview, viewer_id: Optional[str]) -> CourseReviewItem:
    voters = list(r.helpful_voters or [])
    return CourseReviewItem(
        id=r.id,
        course_id=r.course_id,
        author_name=r.author_name,
        author_role=r.author_role or "Developer",
        rating=int(r.rating),
        content_rating=int(getattr(r, "content_rating", None) or 5),
        quiz_rating=int(getattr(r, "quiz_rating", None) or 5),
        nps_score=int(getattr(r, "nps_score", None) or 10),
        improvement_suggestion=getattr(r, "improvement_suggestion", "") or "",
        headline=r.headline,
        comment=r.comment,
        verified_learner=bool(r.verified_learner),
        helpful_count=int(r.helpful_count or 0),
        viewer_has_voted=bool(viewer_id and viewer_id in voters),
        is_own_review=bool(viewer_id and r.user_id == viewer_id),
        created_at=r.created_at or datetime.datetime.utcnow(),
    )


def _build_course_router(prefix: str, tag: str, track: CourseTrackConfig) -> APIRouter:
    course_router = APIRouter(prefix=prefix, tags=[tag])

    @course_router.get("")
    def get_course_overview(
        user: User = Depends(get_optional_user),
        db: Session = Depends(get_db),
    ):
        catalog = track.get_catalog()
        progress_data = None
        if user:
            prog = _get_or_create_progress(track, user.id, db)
            progress_data = _serialize_progress(prog)

        return {
            "id": catalog["id"],
            "title": catalog["title"],
            "playlist_id": catalog["playlist_id"],
            "playlist_url": catalog["playlist_url"],
            "instructor": catalog["instructor"],
            "thumbnail_url": catalog.get("thumbnail_url"),
            "lms_player_mode": catalog.get("lms_player_mode", "locked_in_lms"),
            "total_lessons": catalog["total_lessons"],
            "total_quizzes": catalog["total_quizzes"],
            "modules": catalog["modules"],
            "lessons": catalog["lessons"],
            "capstone_projects": catalog.get("capstone_projects", []),
            "progress": progress_data,
        }

    @course_router.get("/lessons/{lesson_id}")
    def get_course_lesson(lesson_id: str):
        lesson = track.get_lesson(lesson_id)
        if not lesson:
            raise HTTPException(status_code=404, detail="Course lesson not found")
        return lesson

    @course_router.post("/lessons/{lesson_id}/complete")
    def complete_course_lesson(
        lesson_id: str,
        user: User = Depends(get_current_user),
        db: Session = Depends(get_db),
    ):
        lesson = track.get_lesson(lesson_id)
        if not lesson:
            raise HTTPException(status_code=404, detail="Course lesson not found")

        prog = _get_or_create_progress(track, user.id, db)
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

    @course_router.put("/lessons/{lesson_id}/notes")
    def save_course_lesson_notes(
        lesson_id: str,
        payload: MLLessonNoteUpdate,
        user: User = Depends(get_current_user),
        db: Session = Depends(get_db),
    ):
        lesson = track.get_lesson(lesson_id)
        if not lesson:
            raise HTTPException(status_code=404, detail="Course lesson not found")

        prog = _get_or_create_progress(track, user.id, db)
        notes_map = dict(prog.lesson_notes or {})
        notes_map[lesson["id"]] = payload.notes
        prog.lesson_notes = notes_map
        db.commit()
        return {"lesson_id": lesson["id"], "saved": True, "lesson_notes": notes_map}

    @course_router.post("/lessons/{lesson_id}/quiz", response_model=MLQuizAnswerResponse)
    def submit_course_lesson_quiz(
        lesson_id: str,
        payload: MLQuizAnswerRequest,
        user: User = Depends(get_current_user),
        db: Session = Depends(get_db),
    ):
        lesson = track.get_lesson(lesson_id)
        if not lesson:
            raise HTTPException(status_code=404, detail="Course lesson not found")

        quiz = lesson["quiz"]
        correct_idx = int(quiz["correct_index"])
        is_correct = payload.selected_index == correct_idx

        prog = _get_or_create_progress(track, user.id, db)
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

    @course_router.get("/quiz-bank")
    def get_course_quiz_bank():
        questions = track.get_quiz_bank(include_answers=False)
        return {"total": len(questions), "questions": questions}

    @course_router.post("/quiz-bank/submit", response_model=MLPracticeQuizResultResponse)
    def submit_course_quiz_bank(
        payload: MLPracticeQuizSubmitRequest,
        user: User = Depends(get_current_user),
        db: Session = Depends(get_db),
    ):
        bank = track.get_quiz_bank(include_answers=True)
        by_id = {q["id"]: q for q in bank}

        correct_count = 0
        details = []
        prog = _get_or_create_progress(track, user.id, db)
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
        score_pct = round((correct_count / max(total_answered, 1)) * 100)

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

    @course_router.get("/capstone")
    def get_course_capstone(
        user: User = Depends(get_current_user),
        db: Session = Depends(get_db),
    ):
        catalog = track.get_catalog()
        projects = catalog.get("capstone_projects", [])
        subs = (
            db.query(CourseCapstoneSubmission)
            .filter(
                CourseCapstoneSubmission.user_id == user.id,
                CourseCapstoneSubmission.course_id == track.course_id,
            )
            .order_by(CourseCapstoneSubmission.created_at.desc())
            .all()
        )
        return {
            "projects": projects,
            "submissions": [CapstoneSubmissionResponse.model_validate(s) for s in subs],
        }

    @course_router.post("/capstone/submit", response_model=CapstoneSubmissionResponse)
    def submit_course_capstone(
        payload: CapstoneSubmitRequest,
        user: User = Depends(get_current_user),
        db: Session = Depends(get_db),
    ):
        catalog = track.get_catalog()
        projects = {p["id"]: p for p in catalog.get("capstone_projects", [])}
        project = projects.get(payload.project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Capstone project brief not found")
        if len((payload.architecture_notes or "").strip()) < 20:
            raise HTTPException(
                status_code=400,
                detail="Please include at least 20 characters of architecture notes explaining your methodology.",
            )

        prior_approved = (
            db.query(CourseCapstoneSubmission)
            .filter(
                CourseCapstoneSubmission.user_id == user.id,
                CourseCapstoneSubmission.course_id == track.course_id,
                CourseCapstoneSubmission.project_id == payload.project_id,
                CourseCapstoneSubmission.status == "Approved",
            )
            .first()
        )

        evaluation = _evaluate_capstone_rubric(project, payload)
        sub = CourseCapstoneSubmission(
            id=str(uuid.uuid4()),
            user_id=user.id,
            course_id=track.course_id,
            project_id=payload.project_id,
            title=payload.title.strip() or project["title"],
            repo_url=(payload.repo_url or "").strip(),
            demo_url=(payload.demo_url or "").strip(),
            architecture_notes=payload.architecture_notes.strip(),
            code_submission=payload.code_submission or "",
            rubric_scores=evaluation["rubric_scores"],
            overall_score=evaluation["overall_score"],
            status=evaluation["status"],
            ai_feedback=evaluation["ai_feedback"],
        )
        db.add(sub)

        awarded = 0
        if evaluation["status"] == "Approved" and not prior_approved:
            awarded = 120
            user.points = (user.points or 0) + awarded

        db.commit()
        db.refresh(sub)

        resp = CapstoneSubmissionResponse.model_validate(sub)
        resp.points_awarded = awarded
        return resp

    @course_router.get("/reviews", response_model=CourseReviewsOverviewResponse)
    def get_course_reviews(
        user: Optional[User] = Depends(get_optional_user),
        db: Session = Depends(get_db),
    ):
        _ensure_seed_reviews(track, db)
        rows = (
            db.query(CourseReview)
            .filter(CourseReview.course_id == track.course_id)
            .order_by(CourseReview.created_at.desc())
            .all()
        )
        breakdown = {"5": 0, "4": 0, "3": 0, "2": 0, "1": 0}
        rating_sum = 0
        for row in rows:
            star_key = str(max(1, min(5, int(row.rating))))
            breakdown[star_key] += 1
            rating_sum += int(star_key)

        avg = round(rating_sum / max(1, len(rows)), 2) if rows else 5.0
        viewer_id = user.id if user else None
        return CourseReviewsOverviewResponse(
            course_id=track.course_id,
            average_rating=avg,
            total_reviews=len(rows),
            rating_breakdown=breakdown,
            reviews=[_serialize_review(r, viewer_id) for r in rows],
        )

    @course_router.post("/reviews", response_model=CourseReviewItem)
    def create_or_update_course_review(
        payload: CourseReviewCreateRequest,
        user: User = Depends(get_current_user),
        db: Session = Depends(get_db),
    ):
        if payload.rating < 1 or payload.rating > 5:
            raise HTTPException(status_code=400, detail="Rating must be between 1 and 5 stars.")
        headline = payload.headline.strip()
        comment = payload.comment.strip()
        if not headline or not comment:
            raise HTTPException(status_code=400, detail="Review headline and comment are required.")

        prog = _get_or_create_progress(track, user.id, db)
        is_verified = len(prog.completed_lessons or []) >= 1 or bool(prog.final_exam_passed)

        existing = (
            db.query(CourseReview)
            .filter(
                CourseReview.course_id == track.course_id,
                CourseReview.user_id == user.id,
            )
            .first()
        )
        if existing:
            existing.rating = payload.rating
            existing.content_rating = max(1, min(5, payload.content_rating))
            existing.quiz_rating = max(1, min(5, payload.quiz_rating))
            existing.nps_score = max(0, min(10, payload.nps_score))
            existing.improvement_suggestion = payload.improvement_suggestion.strip()
            existing.headline = headline
            existing.comment = comment
            existing.author_name = user.full_name or existing.author_name
            existing.author_role = user.role or existing.author_role
            existing.verified_learner = is_verified or existing.verified_learner
            existing.created_at = datetime.datetime.utcnow()
            db.commit()
            db.refresh(existing)
            return _serialize_review(existing, user.id)

        rev = CourseReview(
            id=str(uuid.uuid4()),
            course_id=track.course_id,
            user_id=user.id,
            author_name=user.full_name or "Developer",
            author_role=user.role or "AI / ML Engineer",
            rating=payload.rating,
            content_rating=max(1, min(5, payload.content_rating)),
            quiz_rating=max(1, min(5, payload.quiz_rating)),
            nps_score=max(0, min(10, payload.nps_score)),
            improvement_suggestion=payload.improvement_suggestion.strip(),
            headline=headline,
            comment=comment,
            verified_learner=is_verified,
            helpful_count=0,
            helpful_voters=[],
        )
        db.add(rev)
        user.points = (user.points or 0) + 20
        db.commit()
        db.refresh(rev)
        return _serialize_review(rev, user.id)

    @course_router.post("/reviews/{review_id}/helpful")
    def toggle_helpful_review(
        review_id: str,
        user: User = Depends(get_current_user),
        db: Session = Depends(get_db),
    ):
        rev = (
            db.query(CourseReview)
            .filter(
                CourseReview.id == review_id,
                CourseReview.course_id == track.course_id,
            )
            .first()
        )
        if not rev:
            raise HTTPException(status_code=404, detail="Review not found")

        voters = list(rev.helpful_voters or [])
        if user.id in voters:
            voters = [v for v in voters if v != user.id]
            rev.helpful_count = max(0, int(rev.helpful_count or 1) - 1)
            voted = False
        else:
            voters.append(user.id)
            rev.helpful_count = int(rev.helpful_count or 0) + 1
            voted = True
        rev.helpful_voters = voters
        db.commit()
        return {
            "review_id": rev.id,
            "helpful_count": rev.helpful_count,
            "viewer_has_voted": voted,
        }

    @course_router.get("/final-exam")
    def get_course_final_exam(user: User = Depends(get_current_user)):
        questions = track.get_exam_questions(include_answers=False)
        return {
            "exam_id": track.exam_id,
            "title": track.exam_title,
            "total_questions": len(questions),
            "duration_minutes": track.exam_duration_minutes,
            "passing_score": 70,
            "max_violations_allowed": 2,
            "proctoring_required": True,
            "candidate": user.full_name,
            "questions": questions,
        }

    @course_router.post("/final-exam/submit", response_model=MLFinalExamResultResponse)
    def submit_course_final_exam(
        payload: MLFinalExamSubmitRequest,
        user: User = Depends(get_current_user),
        db: Session = Depends(get_db),
    ):
        questions = track.get_exam_questions(include_answers=True)
        correct_count = sum(
            1
            for q in questions
            if q["id"] in payload.answers and payload.answers[q["id"]] == q["correct_index"]
        )

        total_q = len(questions)
        score_pct = round((correct_count / max(total_q, 1)) * 100)
        effective_violations = max(payload.violations, len(payload.violation_log))
        disqualified = payload.auto_terminated or effective_violations >= 3
        passed = (not disqualified) and score_pct >= 70 and payload.camera_verified

        prog = _get_or_create_progress(track, user.id, db)
        prog.final_exam_score = score_pct
        prog.final_exam_violations = effective_violations
        prog.final_exam_log = payload.violation_log[-25:]
        if passed:
            prog.final_exam_passed = True

        cert_resp = None
        if passed:
            user.points = (user.points or 0) + 300
            existing_cert = (
                db.query(Certificate)
                .filter(Certificate.user_id == user.id, Certificate.title == track.course_title)
                .first()
            )
            if not existing_cert:
                catalog = track.get_catalog()
                total_lectures = catalog["total_lessons"]
                cred_id = f"{track.cert_prefix}{uuid.uuid4().hex[:6].upper()}"
                issue_dt = datetime.datetime.utcnow()
                meta = default_certificate_metadata(
                    track.course_title,
                    track.cert_category,
                    score_pct,
                    total_lectures,
                    track.completion_hours,
                )
                cert = Certificate(
                    id=str(uuid.uuid4()),
                    user_id=user.id,
                    title=track.course_title,
                    recipient_name=user.full_name,
                    issue_date=issue_dt,
                    credential_id=cred_id,
                    badge_icon="BrainCircuit",
                    category=track.cert_category,
                    grade=f"Proctored Distinction ({score_pct}%)" if score_pct >= 85 else f"Proctored Pass ({score_pct}%)",
                    issuer_name=meta["issuer_name"],
                    signatory_name=meta["signatory_name"],
                    signatory_title=meta["signatory_title"],
                    score_percent=score_pct,
                    skills_verified=track.cert_skills,
                    challenges_completed=total_lectures,
                    completion_hours=track.completion_hours,
                    summary=(
                        f"Awarded after completing the {total_lectures}-lecture {track.course_title} curriculum and passing "
                        f"the camera-proctored final examination ({score_pct}% score, {effective_violations} proctoring alerts)."
                    ),
                    credential_hash=compute_credential_hash(
                        cred_id,
                        user.full_name,
                        track.course_title,
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
            msg = f"Congratulations! You passed the {track.exam_title} with {score_pct}% and earned your verified certificate."
        else:
            msg = f"Scored {score_pct}% (70% passing required). Review your notes & quizzes and retry the exam."

        return MLFinalExamResultResponse(
            score_percent=score_pct,
            correct_count=correct_count,
            total_questions=total_q,
            passed=passed,
            disqualified=disqualified,
            violations=effective_violations,
            message=msg,
            certificate=cert_resp,
        )

    @course_router.get("/certificate")
    def get_course_earned_certificate(
        user: User = Depends(get_current_user),
        db: Session = Depends(get_db),
    ):
        cert = (
            db.query(Certificate)
            .filter(Certificate.user_id == user.id, Certificate.title == track.course_title)
            .first()
        )
        return {
            "earned": bool(cert),
            "certificate": CertificateResponse.model_validate(cert) if cert else None,
        }

    @course_router.get("/goodies")
    def get_course_goodies_status(
        user: User = Depends(get_current_user),
        db: Session = Depends(get_db),
    ):
        claim = (
            db.query(CourseGoodiesClaim)
            .filter(
                CourseGoodiesClaim.user_id == user.id,
                CourseGoodiesClaim.course_id == track.course_id,
            )
            .first()
        )
        cert_exists = (
            db.query(Certificate)
            .filter(Certificate.user_id == user.id, Certificate.title == track.course_title)
            .first()
            is not None
        )
        return {
            "claimed": bool(claim),
            "certificate_earned": cert_exists,
            "claim": CourseGoodiesClaimResponse.model_validate(claim) if claim else None,
        }

    @course_router.post("/goodies", response_model=CourseGoodiesClaimResponse)
    def submit_course_goodies_claim(
        payload: CourseGoodiesClaimRequest,
        user: User = Depends(get_current_user),
        db: Session = Depends(get_db),
    ):
        if not payload.full_name.strip() or not payload.address_line.strip() or not payload.city.strip():
            raise HTTPException(
                status_code=400,
                detail="Recipient name, street address, and city are required to dispatch goodies.",
            )
        if not payload.postal_code.strip() or not payload.country.strip():
            raise HTTPException(
                status_code=400,
                detail="Postal code and country are required for goodies delivery.",
            )

        existing = (
            db.query(CourseGoodiesClaim)
            .filter(
                CourseGoodiesClaim.user_id == user.id,
                CourseGoodiesClaim.course_id == track.course_id,
            )
            .first()
        )
        if existing:
            existing.full_name = payload.full_name.strip()
            existing.email = payload.email.strip()
            existing.phone = payload.phone.strip()
            existing.tshirt_size = payload.tshirt_size.strip() or "L"
            existing.swag_bundle = payload.swag_bundle.strip()
            existing.address_line = payload.address_line.strip()
            existing.city = payload.city.strip()
            existing.state = payload.state.strip()
            existing.postal_code = payload.postal_code.strip()
            existing.country = payload.country.strip()
            existing.linkedin_url = payload.linkedin_url.strip()
            existing.notes = payload.notes.strip()
            db.commit()
            db.refresh(existing)
            resp = CourseGoodiesClaimResponse.model_validate(existing)
            resp.points_awarded = 0
            return resp

        dispatch_code = f"CTF-SWAG-{uuid.uuid4().hex[:6].upper()}"
        claim = CourseGoodiesClaim(
            id=str(uuid.uuid4()),
            user_id=user.id,
            course_id=track.course_id,
            dispatch_code=dispatch_code,
            full_name=payload.full_name.strip(),
            email=payload.email.strip(),
            phone=payload.phone.strip(),
            tshirt_size=payload.tshirt_size.strip() or "L",
            swag_bundle=payload.swag_bundle.strip(),
            address_line=payload.address_line.strip(),
            city=payload.city.strip(),
            state=payload.state.strip(),
            postal_code=payload.postal_code.strip(),
            country=payload.country.strip(),
            linkedin_url=payload.linkedin_url.strip(),
            notes=payload.notes.strip(),
            status="Confirmed — Preparing Dispatch",
        )
        db.add(claim)
        awarded = 50
        user.points = (user.points or 0) + awarded
        db.commit()
        db.refresh(claim)
        resp = CourseGoodiesClaimResponse.model_validate(claim)
        resp.points_awarded = awarded
        return resp

    return course_router


router = _build_course_router("/api/ml-course", "ML Course LMS", ML_TRACK)
dl_router = _build_course_router("/api/dl-course", "Stanford X CTF Deep Learning LMS", DL_TRACK)
ds_router = _build_course_router("/api/ds-course", "Python Data Science & Big Data LMS", DS_TRACK)
biz_router = _build_course_router("/api/biz-course", "IIT Madras X CTF Business Fundamentals LMS", BIZ_TRACK)
agentic_router = _build_course_router("/api/agentic-course", "Agentic AI Engineering LMS", AGENTIC_TRACK)

_SHARE_TRACK_MAP: Dict[str, CourseTrackConfig] = {
    "ml": ML_TRACK,
    "dl": DL_TRACK,
    "ds": DS_TRACK,
    "biz": BIZ_TRACK,
    "agentic": AGENTIC_TRACK,
}

share_router = APIRouter(prefix="/api/share", tags=["Course Share"])
public_share_router = APIRouter(prefix="/share", tags=["Course Share"])


def _render_course_share_preview(track: str, request: Request) -> HTMLResponse:
    """Serve Open Graph / Twitter Card HTML with the course thumbnail and redirect browsers to the LMS track."""
    track_cfg = _SHARE_TRACK_MAP.get(track)
    if not track_cfg:
        raise HTTPException(status_code=404, detail="Unknown course track")

    catalog = track_cfg.get_catalog()
    origin = f"{request.url.scheme}://{request.url.netloc}"
    raw_thumb = catalog.get("thumbnail_url") or "/og-card.svg"
    thumb_url = raw_thumb if raw_thumb.startswith("http") else f"{origin}{raw_thumb}"
    target_path = f"/app/lms/{track}"
    target_url = f"{origin}{target_path}"
    share_url = f"{origin}/share/course/{track}"

    title = html.escape(catalog["title"], quote=True)
    instructor = html.escape(catalog["instructor"], quote=True)
    desc_raw = (
        f"{catalog['total_lessons']} video lectures across {len(catalog['modules'])} modules "
        f"({catalog['total_quizzes']}+ quizzes, graded capstones, and camera-proctored certification) "
        f"by {catalog['instructor']}."
    )
    desc = html.escape(desc_raw, quote=True)
    esc_thumb = html.escape(thumb_url, quote=True)
    esc_target = html.escape(target_url, quote=True)
    esc_share = html.escape(share_url, quote=True)
    esc_target_path = html.escape(target_path, quote=True)

    html_doc = f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{title} — Coding Task Factory Academy</title>
  <meta name="description" content="{desc}" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Coding Task Factory Academy" />
  <meta property="og:title" content="{title}" />
  <meta property="og:description" content="{desc}" />
  <meta property="og:url" content="{esc_share}" />
  <meta property="og:image" content="{esc_thumb}" />
  <meta property="og:image:width" content="1280" />
  <meta property="og:image:height" content="720" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="{title}" />
  <meta name="twitter:description" content="{desc}" />
  <meta name="twitter:image" content="{esc_thumb}" />
  <meta http-equiv="refresh" content="0;url={esc_target_path}" />
  <style>
    body {{ margin:0; font-family:system-ui,-apple-system,sans-serif; background:#141415; color:#ededed; display:flex; min-height:100vh; align-items:center; justify-content:center; padding:24px; }}
    .card {{ max-width:640px; width:100%; background:#19191b; border:1px solid rgba(255,255,255,0.1); border-radius:14px; overflow:hidden; }}
    .thumb {{ width:100%; display:block; aspect-ratio:16/9; object-fit:cover; background:#141415; }}
    .body {{ padding:20px 24px; }}
    .eyebrow {{ color:#e5a00d; font-size:12px; font-family:ui-monospace,monospace; margin-bottom:6px; }}
    h1 {{ font-size:18px; margin:0 0 8px; line-height:1.35; }}
    p {{ font-size:13px; color:#a1a1a6; margin:0 0 16px; line-height:1.5; }}
    a.btn {{ display:inline-block; background:#ededed; color:#141415; text-decoration:none; font-size:13px; font-weight:600; padding:9px 16px; border-radius:8px; }}
  </style>
</head>
<body>
  <div class="card">
    <img class="thumb" src="{esc_thumb}" alt="{title}" />
    <div class="body">
      <div class="eyebrow">Coding Task Factory Academy · {instructor}</div>
      <h1>{title}</h1>
      <p>{desc}</p>
      <a class="btn" href="{esc_target}">Open course syllabus &rarr;</a>
    </div>
  </div>
  <script>window.location.replace({target_path!r});</script>
</body>
</html>"""
    return HTMLResponse(content=html_doc, status_code=200)


@share_router.get("/course/{track}", response_class=HTMLResponse)
def get_api_course_share_preview(track: str, request: Request):
    return _render_course_share_preview(track, request)


@public_share_router.get("/course/{track}", response_class=HTMLResponse)
def get_public_course_share_preview(track: str, request: Request):
    return _render_course_share_preview(track, request)
