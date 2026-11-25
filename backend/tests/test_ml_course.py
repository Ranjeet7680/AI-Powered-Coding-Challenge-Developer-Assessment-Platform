import os
import sys
import tempfile
import uuid

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Ensure backend package is importable regardless of pytest CWD
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app import main as app_main  # noqa: E402
from app.database import Base, get_db  # noqa: E402
from app.main import app  # noqa: E402
from app.services.ml_course_catalog import (  # noqa: E402
    get_100_quiz_bank,
    get_final_exam_questions,
)


@pytest.fixture(scope="module")
def ml_client():
    fd, db_path = tempfile.mkstemp(prefix="ml_course_test_", suffix=".db")
    os.close(fd)
    test_url = f"sqlite:///{db_path}"
    test_engine = create_engine(test_url, connect_args={"check_same_thread": False})
    TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
    Base.metadata.create_all(bind=test_engine)

    def override_get_db():
        db = TestingSession()
        try:
            yield db
        finally:
            db.close()

    prev_overrides = dict(app.dependency_overrides)
    prev_session_local = app_main.SessionLocal
    app.dependency_overrides[get_db] = override_get_db
    app_main.SessionLocal = TestingSession

    try:
        with TestClient(app) as client:
            yield client
    finally:
        app.dependency_overrides = prev_overrides
        app_main.SessionLocal = prev_session_local
        test_engine.dispose()
        try:
            os.remove(db_path)
        except OSError:
            pass


def _register_and_auth(client: TestClient) -> dict:
    email = f"ml.learner.{uuid.uuid4().hex[:8]}@example.com"
    resp = client.post(
        "/api/auth/register",
        json={
            "full_name": "Ada Lovelace ML",
            "email": email,
            "password": "MLCourse#Pass2026!",
        },
    )
    assert resp.status_code in (200, 201), resp.text
    token = resp.json()["token"]
    return {"Authorization": f"Bearer {token}"}


def test_ml_course_catalog_has_106_videos_and_7_modules(ml_client: TestClient):
    resp = ml_client.get("/api/ml-course")
    assert resp.status_code == 200, resp.text
    data = resp.json()

    assert data["playlist_id"] == "PLblh5JKOoLUICTaGLRoHQDuF_7q2GfuJF"
    assert data["total_lessons"] == 106
    assert data["total_quizzes"] == 106
    assert len(data["modules"]) == 7
    assert len(data["lessons"]) == 106

    first = data["lessons"][0]
    last = data["lessons"][-1]
    assert first["order"] == 1
    assert first["video_id"] == "Gv9_4yMHFhI"
    assert last["order"] == 106
    assert last["video_id"] == "qPN_XZcJf_s"

    orders = [lesson["order"] for lesson in data["lessons"]]
    assert orders == list(range(1, 107))

    for lesson in data["lessons"]:
        assert lesson["notes_markdown"].strip()
        assert lesson["key_formula"].strip()
        assert lesson["quiz"]["question"].strip()
        assert len(lesson["quiz"]["options"]) == 4


def test_ml_lesson_complete_notes_and_after_video_quiz(ml_client: TestClient):
    headers = _register_and_auth(ml_client)

    # Mark lecture #1 complete (should award +15 XP once)
    comp1 = ml_client.post("/api/ml-course/lessons/ml-001/complete", headers=headers)
    assert comp1.status_code == 200, comp1.text
    assert comp1.json()["points_awarded"] == 15
    assert "ml-001" in comp1.json()["completed_lessons"]

    comp2 = ml_client.post("/api/ml-course/lessons/ml-001/complete", headers=headers)
    assert comp2.status_code == 200
    assert comp2.json()["points_awarded"] == 0

    # Save personal notes
    note_payload = {"notes": "Cross-validation compares bias-variance generalization cleanly."}
    note_resp = ml_client.put(
        "/api/ml-course/lessons/ml-001/notes",
        json=note_payload,
        headers=headers,
    )
    assert note_resp.status_code == 200, note_resp.text
    assert note_resp.json()["saved"] is True
    assert note_resp.json()["lesson_notes"]["ml-001"] == note_payload["notes"]

    # After-video quiz check (incorrect then correct)
    bank = get_100_quiz_bank(include_answers=True)
    q1 = bank[0]
    wrong_idx = (q1["correct_index"] + 1) % len(q1["options"])
    wrong_resp = ml_client.post(
        "/api/ml-course/lessons/ml-001/quiz",
        json={"selected_index": wrong_idx},
        headers=headers,
    )
    assert wrong_resp.status_code == 200
    assert wrong_resp.json()["correct"] is False
    assert wrong_resp.json()["points_awarded"] == 0

    right_resp = ml_client.post(
        "/api/ml-course/lessons/ml-001/quiz",
        json={"selected_index": q1["correct_index"]},
        headers=headers,
    )
    assert right_resp.status_code == 200
    assert right_resp.json()["correct"] is True
    assert right_resp.json()["points_awarded"] == 10

    # Verify overview hydrates saved progress
    overview = ml_client.get("/api/ml-course", headers=headers).json()["progress"]
    assert "ml-001" in overview["completed_lessons"]
    assert overview["lesson_notes"]["ml-001"] == note_payload["notes"]
    assert overview["quiz_results"]["ml-001"]["correct"] is True


def test_ml_100_quiz_practice_bank_strips_answers_and_grades(ml_client: TestClient):
    headers = _register_and_auth(ml_client)

    public_bank_resp = ml_client.get("/api/ml-course/quiz-bank")
    assert public_bank_resp.status_code == 200
    public_bank = public_bank_resp.json()
    assert public_bank["total"] >= 100
    assert len(public_bank["questions"]) == 106
    for q in public_bank["questions"]:
        assert "correct_index" not in q
        assert "explanation" not in q

    truth = get_100_quiz_bank(include_answers=True)
    answers = {q["id"]: q["correct_index"] for q in truth[:20]}
    submit_resp = ml_client.post(
        "/api/ml-course/quiz-bank/submit",
        json={"answers": answers},
        headers=headers,
    )
    assert submit_resp.status_code == 200, submit_resp.text
    res = submit_resp.json()
    assert res["total_answered"] == 20
    assert res["correct_count"] == 20
    assert res["score_percent"] == 100
    assert res["best_score"] == 100


def test_ml_proctored_final_exam_anti_cheat_and_certificate_pdf(ml_client: TestClient):
    headers = _register_and_auth(ml_client)

    exam_resp = ml_client.get("/api/ml-course/final-exam", headers=headers)
    assert exam_resp.status_code == 200, exam_resp.text
    exam_meta = exam_resp.json()
    assert exam_meta["total_questions"] == 35
    assert exam_meta["proctoring_required"] is True
    assert exam_meta["passing_score"] == 70
    for q in exam_meta["questions"]:
        assert "correct_index" not in q
        assert "explanation" not in q

    truth = get_final_exam_questions(include_answers=True)
    perfect_answers = {q["id"]: q["correct_index"] for q in truth}

    # 1) 3-strike cheat termination must disqualify even with 100% answers
    cheat_resp = ml_client.post(
        "/api/ml-course/final-exam/submit",
        json={
            "answers": perfect_answers,
            "violations": 3,
            "violation_log": [
                {"timestamp": "2026-11-25T12:00:00Z", "type": "TAB_SWITCH", "detail": "Left tab"},
                {"timestamp": "2026-11-25T12:00:10Z", "type": "CAMERA_OBSTRUCTED", "detail": "Dark"},
                {"timestamp": "2026-11-25T12:00:20Z", "type": "MULTIPLE_FACES", "detail": "2 faces"},
            ],
            "elapsed_seconds": 300,
            "camera_verified": True,
            "auto_terminated": True,
        },
        headers=headers,
    )
    assert cheat_resp.status_code == 200, cheat_resp.text
    cheat_data = cheat_resp.json()
    assert cheat_data["disqualified"] is True
    assert cheat_data["passed"] is False
    assert cheat_data["certificate"] is None

    # 2) Missing camera verification must block certificate issuance
    nocam_resp = ml_client.post(
        "/api/ml-course/final-exam/submit",
        json={
            "answers": perfect_answers,
            "violations": 0,
            "violation_log": [],
            "elapsed_seconds": 320,
            "camera_verified": False,
            "auto_terminated": False,
        },
        headers=headers,
    )
    assert nocam_resp.status_code == 200
    nocam_data = nocam_resp.json()
    assert nocam_data["passed"] is False
    assert nocam_data["certificate"] is None

    # 3) Legitimate camera-verified pass issues verified certificate + Vector PDF
    pass_resp = ml_client.post(
        "/api/ml-course/final-exam/submit",
        json={
            "answers": perfect_answers,
            "violations": 0,
            "violation_log": [],
            "elapsed_seconds": 900,
            "camera_verified": True,
            "auto_terminated": False,
        },
        headers=headers,
    )
    assert pass_resp.status_code == 200, pass_resp.text
    pass_data = pass_resp.json()
    assert pass_data["passed"] is True
    assert pass_data["disqualified"] is False
    assert pass_data["score_percent"] == 100
    cert = pass_data["certificate"]
    assert cert is not None
    cred_id = cert["credential_id"]
    assert cred_id.startswith("CTF-ML-")

    # Public credential verification & ReportLab PDF export
    verify_resp = ml_client.get(f"/api/certificates/{cred_id}/verify")
    assert verify_resp.status_code == 200, verify_resp.text
    assert verify_resp.json()["verified"] is True

    pdf_resp = ml_client.get(f"/api/certificates/{cred_id}/pdf", headers=headers)
    assert pdf_resp.status_code == 200, pdf_resp.text
    assert pdf_resp.headers["content-type"].startswith("application/pdf")
    assert pdf_resp.content.startswith(b"%PDF")
