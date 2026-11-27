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
from app.services.dl_course_catalog import (  # noqa: E402
    DL_COURSE_TITLE,
    get_dl_final_exam_questions,
    get_dl_quiz_bank,
)
from app.services.ds_course_catalog import (  # noqa: E402
    DS_COURSE_TITLE,
    get_ds_final_exam_questions,
    get_ds_quiz_bank,
)
from app.services.biz_course_catalog import (  # noqa: E402
    BIZ_COURSE_TITLE,
    get_biz_final_exam_questions,
    get_biz_quiz_bank,
)
from app.services.agentic_course_catalog import (  # noqa: E402
    AGENTIC_COURSE_TITLE,
    get_agentic_final_exam_questions,
    get_agentic_quiz_bank,
)
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


def test_stanford_ctf_dl_course_21_videos_20_quizzes_and_proctored_exam(ml_client: TestClient):
    headers = _register_and_auth(ml_client)

    overview_resp = ml_client.get("/api/dl-course", headers=headers)
    assert overview_resp.status_code == 200, overview_resp.text
    overview = overview_resp.json()

    assert overview["title"] == DL_COURSE_TITLE
    assert overview["playlist_id"] == "PLA89DCFA6ADACE599"
    assert overview["thumbnail_url"] == "/thumbnails/stanford-ctf-dl-thumbnail.svg"
    assert overview["total_lessons"] == 21
    assert overview["total_quizzes"] == 21
    assert len(overview["modules"]) == 4
    assert len(overview["lessons"]) == 21
    assert overview["lessons"][0]["video_id"] == "UzxYlbK2c7E"
    assert overview["lessons"][-1]["video_id"] == "yCqPMD6coO8"
    assert overview["lessons"][10]["video_id"] == "PySo_6S4ZAg"

    # Completion + personal notes + per-video comprehension quiz
    comp = ml_client.post("/api/dl-course/lessons/dl-001/complete", headers=headers)
    assert comp.status_code == 200, comp.text
    assert comp.json()["points_awarded"] == 15

    note_res = ml_client.put(
        "/api/dl-course/lessons/dl-001/notes",
        json={"notes": "CS229 Lecture 1 notes: supervised vs unsupervised mapping."},
        headers=headers,
    )
    assert note_res.status_code == 200
    assert note_res.json()["saved"] is True

    # 20+ quiz mastery bank strips answers and grades submissions
    bank_resp = ml_client.get("/api/dl-course/quiz-bank")
    assert bank_resp.status_code == 200
    bank = bank_resp.json()
    assert bank["total"] >= 20
    assert len(bank["questions"]) == 21
    for q in bank["questions"]:
        assert "correct_index" not in q
        assert "explanation" not in q

    truth_bank = get_dl_quiz_bank(include_answers=True)
    batch_answers = {q["id"]: q["correct_index"] for q in truth_bank[:20]}
    batch_res = ml_client.post(
        "/api/dl-course/quiz-bank/submit",
        json={"answers": batch_answers},
        headers=headers,
    )
    assert batch_res.status_code == 200
    assert batch_res.json()["total_answered"] == 20
    assert batch_res.json()["score_percent"] == 100

    # Proctored Final Exam (20 questions + camera verification + anti-cheat + PDF cert)
    exam_meta = ml_client.get("/api/dl-course/final-exam", headers=headers).json()
    assert exam_meta["total_questions"] == 20
    assert exam_meta["proctoring_required"] is True

    exam_truth = get_dl_final_exam_questions(include_answers=True)
    perfect = {q["id"]: q["correct_index"] for q in exam_truth}

    # Cheat termination must disqualify
    cheat = ml_client.post(
        "/api/dl-course/final-exam/submit",
        json={
            "answers": perfect,
            "violations": 3,
            "violation_log": [{"timestamp": "2026-11-25T14:00:00Z", "type": "TAB_SWITCH", "detail": "left"}],
            "elapsed_seconds": 120,
            "camera_verified": True,
            "auto_terminated": True,
        },
        headers=headers,
    ).json()
    assert cheat["disqualified"] is True
    assert cheat["passed"] is False
    assert cheat["certificate"] is None

    # Legitimate pass issues [Stanford X Coding Task Factory Academy] Deep Learning certificate
    passed = ml_client.post(
        "/api/dl-course/final-exam/submit",
        json={
            "answers": perfect,
            "violations": 0,
            "violation_log": [],
            "elapsed_seconds": 600,
            "camera_verified": True,
            "auto_terminated": False,
        },
        headers=headers,
    ).json()
    assert passed["passed"] is True
    assert passed["score_percent"] == 100
    cert = passed["certificate"]
    assert cert is not None
    assert cert["title"] == DL_COURSE_TITLE
    cred_id = cert["credential_id"]
    assert cred_id.startswith("CTF-DL-")

    verify = ml_client.get(f"/api/certificates/{cred_id}/verify")
    assert verify.status_code == 200
    assert verify.json()["verified"] is True

    pdf = ml_client.get(f"/api/certificates/{cred_id}/pdf", headers=headers)
    assert pdf.status_code == 200
    assert pdf.content.startswith(b"%PDF")


def test_lms_in_lms_player_advanced_syllabus_capstones_and_reviews(ml_client: TestClient):
    headers = _register_and_auth(ml_client)

    # 1. Verify privacy-enhanced In-LMS playback URLs & rich syllabus metadata
    dl_data = ml_client.get("/api/dl-course", headers=headers).json()
    assert dl_data["lms_player_mode"] == "locked_in_lms"
    assert "youtube-nocookie.com/embed/UzxYlbK2c7E" in dl_data["lessons"][0]["video_url"]
    assert "modestbranding=1" in dl_data["lessons"][0]["video_url"]
    assert len(dl_data["modules"][0]["learning_objectives"]) >= 2
    assert len(dl_data["modules"][0]["key_topics"]) >= 2
    assert dl_data["modules"][1]["prerequisite_module_ids"] == ["dl-mod-1"]
    assert len(dl_data["capstone_projects"]) == 3

    ml_data = ml_client.get("/api/ml-course", headers=headers).json()
    assert ml_data["lms_player_mode"] == "locked_in_lms"
    assert "youtube-nocookie.com/embed/Gv9_4yMHFhI" in ml_data["lessons"][0]["video_url"]
    assert len(ml_data["capstone_projects"]) == 3

    # 2. Test Capstone Project Assignment Evaluation & XP Award (+120 XP)
    cap_res = ml_client.post(
        "/api/dl-course/capstone/submit",
        json={
            "project_id": "dl-cap-1",
            "title": "Vectorized Deep Neural Engine",
            "repo_url": "https://github.com/example/dl-autograd-capstone",
            "architecture_notes": (
                "Implemented vectorized He initialization with ReLU activations and checked analytical "
                "vs numerical finite-difference gradients across 4 layers with Dev error analysis."
            ),
            "code_submission": (
                "import numpy as np\n"
                "class DeepNet:\n"
                "    def __init__(self, d):\n"
                "        self.W = np.random.randn(d, d) * np.sqrt(2.0 / d)\n"
                "    def forward(self, x):\n"
                "        return np.maximum(0, x @ self.W)\n"
                "    def loss(self, logits, y):\n"
                "        return np.mean((logits - y) ** 2)\n"
            ),
        },
        headers=headers,
    )
    assert cap_res.status_code == 200, cap_res.text
    sub = cap_res.json()
    assert sub["overall_score"] >= 70
    assert sub["status"] == "Approved"
    assert sub["points_awarded"] == 120
    assert len(sub["rubric_scores"]) == 4

    cap_list = ml_client.get("/api/dl-course/capstone", headers=headers).json()
    assert len(cap_list["submissions"]) == 1

    # 3. Test Peer Reviews & Helpful Upvoting (+20 XP)
    rev_overview = ml_client.get("/api/dl-course/reviews", headers=headers).json()
    assert rev_overview["total_reviews"] >= 3

    post_rev = ml_client.post(
        "/api/dl-course/reviews",
        json={
            "rating": 5,
            "headline": "Superb CS229 derivations + proctored exam",
            "comment": "Keeping all lectures inside the LMS with capstone rubric grading made revision productive.",
        },
        headers=headers,
    )
    assert post_rev.status_code == 200, post_rev.text
    created_rev = post_rev.json()
    assert created_rev["rating"] == 5
    assert created_rev["is_own_review"] is True

    # Upvote toggle on the review
    vote1 = ml_client.post(f"/api/dl-course/reviews/{created_rev['id']}/helpful", headers=headers).json()
    assert vote1["viewer_has_voted"] is True
    assert vote1["helpful_count"] == 1

    vote2 = ml_client.post(f"/api/dl-course/reviews/{created_rev['id']}/helpful", headers=headers).json()
    assert vote2["viewer_has_voted"] is False
    assert vote2["helpful_count"] == 0


def test_lms_feedback_certificate_goodies_claim_end_to_end(ml_client: TestClient):
    headers = _register_and_auth(ml_client)

    # 1. Certificate check before exam
    cert_before = ml_client.get("/api/dl-course/certificate", headers=headers).json()
    assert cert_before["earned"] is False
    assert cert_before["certificate"] is None

    # 2. Structured Feedback Survey Submission
    fb_resp = ml_client.post(
        "/api/dl-course/reviews",
        json={
            "rating": 5,
            "content_rating": 5,
            "quiz_rating": 5,
            "nps_score": 10,
            "headline": "End-to-end flow feels seamless",
            "comment": "Detail -> syllabus -> lectures -> quiz -> exam -> certificate -> goodies worked cleanly.",
            "improvement_suggestion": "Keep adding more PyTorch capstones!",
        },
        headers=headers,
    )
    assert fb_resp.status_code == 200, fb_resp.text
    fb = fb_resp.json()
    assert fb["content_rating"] == 5
    assert fb["quiz_rating"] == 5
    assert fb["nps_score"] == 10

    # 3. Goodies Swag Claim Form Validation & Persistence (+50 XP)
    bad_goodies = ml_client.post(
        "/api/dl-course/goodies",
        json={
            "full_name": "",
            "email": "test@example.com",
            "swag_bundle": "Complete Graduate Swag Box",
            "address_line": "",
            "city": "",
            "postal_code": "",
            "country": "",
        },
        headers=headers,
    )
    assert bad_goodies.status_code == 400

    good_res = ml_client.post(
        "/api/dl-course/goodies",
        json={
            "full_name": "Ada Lovelace",
            "email": "ada@example.com",
            "phone": "+91 9876543210",
            "tshirt_size": "M",
            "swag_bundle": "Complete Graduate Swag Box",
            "address_line": "42 Neural Network Blvd, Apt 7B",
            "city": "Bengaluru",
            "state": "KA",
            "postal_code": "560001",
            "country": "India",
            "linkedin_url": "https://linkedin.com/in/ada-ml",
            "notes": "Excited for the hoodie!",
        },
        headers=headers,
    )
    assert good_res.status_code == 200, good_res.text
    claim = good_res.json()
    assert claim["dispatch_code"].startswith("CTF-SWAG-")
    assert claim["points_awarded"] == 50
    assert claim["swag_bundle"] == "Complete Graduate Swag Box"

    # Second status check confirms persistence
    status_res = ml_client.get("/api/dl-course/goodies", headers=headers).json()
    assert status_res["claimed"] is True
    assert status_res["claim"]["dispatch_code"] == claim["dispatch_code"]


def test_eight_video_playlists_watch_context_and_platform_embeds(ml_client: TestClient):
    pl_resp = ml_client.get("/api/videos/playlists")
    assert pl_resp.status_code == 200, pl_resp.text
    playlists = pl_resp.json()
    assert len(playlists) == 8

    expected_counts = {
        "PLZ2ps__7DhBb2cXAu5PevO_mzgS3Fj3Fs": 95,
        "PLZ2ps__7DhBammhVmBE9f5eezTj2kDfTN": 93,
        "PLZ2ps__7DhBb3ovNQam2c_WcGeiW9OhQo": 98,
        "PLZ2ps__7DhBZVxMrSkTIcG6zZBDKUXCnM": 68,
        "PLZ2ps__7DhBbDiVplM2I9q2XNso1Qfj62": 44,
        "PLZ2ps__7DhBaXTORd_OKXZRXCMh3dGnBZ": 66,
        "PLqu1LEUz3ju04dXn0JOgKYPHHnV2at-lG": 77,
        "PLUQpHm_JtukII_8U9pucV61MX2YE2CSUt": 49,
    }
    actual_counts = {p["playlist_id"]: p["video_count"] for p in playlists}
    assert actual_counts == expected_counts
    assert sum(actual_counts.values()) == 590

    all_resp = ml_client.get("/api/videos")
    assert all_resp.status_code == 200, all_resp.text
    all_videos = all_resp.json()
    assert len(all_videos) >= 596
    blocked_or_dead = {"jGwO_UgTS7I", "pLhPQynL0tY", "wjZofJX0v4U", "7V35oxV9_j0", "iuqZvajTO4A"}
    for v in all_videos:
        assert v["video_url"].startswith("https://www.youtube-nocookie.com/embed/")
        assert "youtube.com/watch" not in v["video_url"]
        assert not any(bad in v["video_url"] for bad in blocked_or_dead)

    emb_resp = ml_client.get("/api/videos?playlist_id=PLUQpHm_JtukII_8U9pucV61MX2YE2CSUt")
    assert emb_resp.status_code == 200, emb_resp.text
    emb_videos = emb_resp.json()
    assert len(emb_videos) == 49
    assert [v["episode_order"] for v in emb_videos] == list(range(1, 50))

    ctx_resp = ml_client.get("/api/videos/pl-embc-001/watch-context")
    assert ctx_resp.status_code == 200, ctx_resp.text
    ctx = ctx_resp.json()
    assert ctx["video"]["id"] == "pl-embc-001"
    assert ctx["series"]["playlist_id"] == "PLUQpHm_JtukII_8U9pucV61MX2YE2CSUt"
    assert len(ctx["series_videos"]) == 49
    assert ctx["prev_video"] is None
    assert ctx["next_video"]["id"] == "pl-embc-002"
    assert ctx["platform_share_path"] == "/app/videos/pl-embc-001"
    assert "youtube.com" not in ctx["platform_share_path"]


def test_proctor_log_tamper_resistance(ml_client: TestClient):
    headers = _register_and_auth(ml_client)
    exam_truth = get_dl_final_exam_questions(include_answers=True)
    perfect = {q["id"]: q["correct_index"] for q in exam_truth}

    # Client sends tampered violations=0 alongside 3 recorded log violations -> must still disqualify
    tampered_res = ml_client.post(
        "/api/dl-course/final-exam/submit",
        json={
            "answers": perfect,
            "violations": 0,
            "violation_log": [
                {"timestamp": "2026-11-26T00:00:01Z", "type": "PROHIBITED_OBJECT", "detail": "cell phone detected"},
                {"timestamp": "2026-11-26T00:00:03Z", "type": "FACE_OCCLUDED_OR_MISSING", "detail": "face covered"},
                {"timestamp": "2026-11-26T00:00:06Z", "type": "SPLIT_SCREEN_DETECTED", "detail": "resized window"},
            ],
            "elapsed_seconds": 300,
            "camera_verified": True,
            "auto_terminated": False,
        },
        headers=headers,
    )
    assert tampered_res.status_code == 200, tampered_res.text
    data = tampered_res.json()
    assert data["disqualified"] is True
    assert data["violations"] == 3
    assert data["passed"] is False
    assert data["certificate"] is None


def test_ds_course_14_videos_quizzes_capstones_exam_and_certificate(ml_client: TestClient):
    headers = _register_and_auth(ml_client)

    overview_resp = ml_client.get("/api/ds-course", headers=headers)
    assert overview_resp.status_code == 200, overview_resp.text
    overview = overview_resp.json()

    assert overview["title"] == DS_COURSE_TITLE
    assert overview["total_lessons"] == 14
    assert len(overview["modules"]) == 3
    assert len(overview["lessons"]) == 14
    assert len(overview["capstone_projects"]) == 3
    assert overview["lms_player_mode"] == "locked_in_lms"

    for lesson in overview["lessons"]:
        assert lesson["video_url"].startswith("https://www.youtube-nocookie.com/embed/")
        assert "youtube.com/watch" not in lesson["video_url"]
        assert "Quiz" in lesson["quiz"]["question"] or len(lesson["quiz"]["options"]) == 4

    # Complete first DS lecture + save note (ensure isolated from ML/DL progress)
    comp = ml_client.post("/api/ds-course/lessons/ds-001/complete", headers=headers)
    assert comp.status_code == 200, comp.text
    assert comp.json()["points_awarded"] == 15

    note_res = ml_client.put(
        "/api/ds-course/lessons/ds-001/notes",
        json={"notes": "Reviewed Big Data 3Vs: Volume, Velocity, Variety."},
        headers=headers,
    )
    assert note_res.status_code == 200
    assert note_res.json()["saved"] is True

    # Verify ML progress remains completely separate for same user
    ml_check = ml_client.get("/api/ml-course", headers=headers).json()
    assert "ds-001" not in ml_check["progress"]["completed_lessons"]

    # Seeded Data Science reviews exist
    rev_overview = ml_client.get("/api/ds-course/reviews", headers=headers).json()
    assert rev_overview["total_reviews"] >= 3

    # Quiz bank has all 14 Data Science questions with zero secret answers leaked
    bank_resp = ml_client.get("/api/ds-course/quiz-bank")
    assert bank_resp.status_code == 200
    bank_qs = bank_resp.json()["questions"]
    assert len(bank_qs) == 14
    assert all("correct_index" not in q for q in bank_qs)

    truth_bank = get_ds_quiz_bank(include_answers=True)
    practice_submit = ml_client.post(
        "/api/ds-course/quiz-bank/submit",
        json={"answers": {q["id"]: q["correct_index"] for q in truth_bank}},
        headers=headers,
    )
    assert practice_submit.status_code == 200
    assert practice_submit.json()["score_percent"] == 100

    # Capstone submission
    cap_resp = ml_client.post(
        "/api/ds-course/capstone/submit",
        json={
            "project_id": overview["capstone_projects"][0]["id"],
            "title": "Vectorized NumPy Telemetry Ranking",
            "repo_url": "https://github.com/coding-task-factory/ds-numpy-capstone",
            "architecture_notes": (
                "Implemented axis=0 z-score standardization across sensor readings, handled zero-variance "
                "columns cleanly without NaN division, and used np.argsort for fast top-k telemetry ranking."
            ),
            "code_submission": (
                "import numpy as np\n\n"
                "def rank_sensors(matrix: np.ndarray, top_k: int = 3) -> np.ndarray:\n"
                "    means = matrix.mean(axis=0, keepdims=True)\n"
                "    stds = np.where(matrix.std(axis=0, keepdims=True) == 0, 1.0, matrix.std(axis=0, keepdims=True))\n"
                "    scores = ((matrix - means) / stds).mean(axis=0)\n"
                "    return np.argsort(scores)[::-1][:top_k]\n"
            ),
        },
        headers=headers,
    )
    assert cap_resp.status_code == 200, cap_resp.text
    assert cap_resp.json()["status"] == "Approved"

    # Proctored final exam -> Certificate -> PDF -> Goodies flow
    exam_meta = ml_client.get("/api/ds-course/final-exam", headers=headers).json()
    assert exam_meta["total_questions"] == 14
    assert exam_meta["duration_minutes"] == 25

    exam_truth = get_ds_final_exam_questions(include_answers=True)
    pass_resp = ml_client.post(
        "/api/ds-course/final-exam/submit",
        json={
            "answers": {q["id"]: q["correct_index"] for q in exam_truth},
            "violations": 0,
            "violation_log": [],
            "elapsed_seconds": 360,
            "camera_verified": True,
            "auto_terminated": False,
        },
        headers=headers,
    )
    assert pass_resp.status_code == 200, pass_resp.text
    pass_data = pass_resp.json()
    assert pass_data["passed"] is True
    assert pass_data["score_percent"] == 100
    cert = pass_data["certificate"]
    assert cert is not None
    assert cert["title"] == DS_COURSE_TITLE
    assert cert["credential_id"].startswith("CTF-DS-")

    pdf_resp = ml_client.get(f"/api/certificates/{cert['credential_id']}/pdf")
    assert pdf_resp.status_code == 200
    assert pdf_resp.headers.get("content-type", "").startswith("application/pdf")

    goodies = ml_client.post(
        "/api/ds-course/goodies",
        json={
            "full_name": "Data Graduate",
            "email": "ds.grad@example.com",
            "phone": "+919876543210",
            "tshirt_size": "M",
            "swag_bundle": "Complete Graduate Swag Box",
            "address_line": "101 Analytics Way",
            "city": "Bengaluru",
            "state": "KA",
            "postal_code": "560001",
            "country": "India",
        },
        headers=headers,
    )
    assert goodies.status_code == 200, goodies.text
    assert goodies.json()["course_id"] == overview["id"]
    assert goodies.json()["dispatch_code"].startswith("CTF-SWAG-")


@pytest.mark.parametrize(
    "prefix,expected_title,expected_lessons,expected_modules,expected_exam_qs,cert_prefix,get_truth_bank,get_truth_exam,cap_title",
    [
        (
            "/api/biz-course",
            BIZ_COURSE_TITLE,
            66,
            6,
            30,
            "CTF-BIZ-",
            get_biz_quiz_bank,
            get_biz_final_exam_questions,
            "Constant-Elasticity Pricing Optimizer",
        ),
        (
            "/api/agentic-course",
            AGENTIC_COURSE_TITLE,
            23,
            4,
            20,
            "CTF-AG-",
            get_agentic_quiz_bank,
            get_agentic_final_exam_questions,
            "Stateful LangGraph Router & MCP",
        ),
    ],
)
def test_biz_and_agentic_courses_end_to_end(
    ml_client: TestClient,
    prefix: str,
    expected_title: str,
    expected_lessons: int,
    expected_modules: int,
    expected_exam_qs: int,
    cert_prefix: str,
    get_truth_bank,
    get_truth_exam,
    cap_title: str,
):
    headers = _register_and_auth(ml_client)

    ov_resp = ml_client.get(prefix, headers=headers)
    assert ov_resp.status_code == 200, ov_resp.text
    ov = ov_resp.json()

    assert ov["title"] == expected_title
    assert ov["total_lessons"] == expected_lessons
    assert len(ov["modules"]) == expected_modules
    assert len(ov["lessons"]) == expected_lessons
    assert len(ov["capstone_projects"]) == 3
    assert ov["lms_player_mode"] == "locked_in_lms"

    first_id = ov["lessons"][0]["id"]
    comp = ml_client.post(f"{prefix}/lessons/{first_id}/complete", headers=headers)
    assert comp.status_code == 200, comp.text
    assert comp.json()["points_awarded"] == 15

    bank_resp = ml_client.get(f"{prefix}/quiz-bank")
    assert bank_resp.status_code == 200
    bank_qs = bank_resp.json()["questions"]
    assert len(bank_qs) == expected_lessons
    assert all("correct_index" not in q for q in bank_qs)

    truth_bank = get_truth_bank(include_answers=True)
    batch = ml_client.post(
        f"{prefix}/quiz-bank/submit",
        json={"answers": {q["id"]: q["correct_index"] for q in truth_bank}},
        headers=headers,
    )
    assert batch.status_code == 200
    assert batch.json()["score_percent"] == 100

    cap = ml_client.post(
        f"{prefix}/capstone/submit",
        json={
            "project_id": ov["capstone_projects"][0]["id"],
            "title": cap_title,
            "repo_url": "https://github.com/coding-task-factory/capstone-verified",
            "architecture_notes": (
                "Validated quantitative objective constraints, deterministic edge-case handling, and automated unit checks across sample data."
            ),
            "code_submission": (
                "import numpy as np\n\n"
                "def evaluate_pipeline(values):\n"
                "    arr = np.asarray(values, dtype=float)\n"
                "    if arr.size == 0:\n"
                "        return 0.0\n"
                "    return float(arr.mean())\n"
            ),
        },
        headers=headers,
    )
    assert cap.status_code == 200, cap.text
    assert cap.json()["status"] == "Approved"

    exam_meta = ml_client.get(f"{prefix}/final-exam", headers=headers).json()
    assert exam_meta["total_questions"] == expected_exam_qs

    truth_exam = get_truth_exam(include_answers=True)
    exam_res = ml_client.post(
        f"{prefix}/final-exam/submit",
        json={
            "answers": {q["id"]: q["correct_index"] for q in truth_exam},
            "violations": 0,
            "violation_log": [],
            "elapsed_seconds": 420,
            "camera_verified": True,
            "auto_terminated": False,
        },
        headers=headers,
    )
    assert exam_res.status_code == 200, exam_res.text
    exam_data = exam_res.json()
    assert exam_data["passed"] is True
    assert exam_data["score_percent"] == 100
    cert = exam_data["certificate"]
    assert cert["title"] == expected_title
    assert cert["credential_id"].startswith(cert_prefix)

    pdf_resp = ml_client.get(f"/api/certificates/{cert['credential_id']}/pdf")
    assert pdf_resp.status_code == 200
    assert pdf_resp.headers.get("content-type", "").startswith("application/pdf")


@pytest.mark.parametrize(
    "track,expected_thumb",
    [
        ("ml", "ml-ctf-course-thumbnail.svg"),
        ("dl", "stanford-ctf-dl-thumbnail.svg"),
        ("ds", "ds-ctf-course-thumbnail.svg"),
        ("biz", "iitm-ctf-biz-thumbnail.svg"),
        ("agentic", "agentic-ctf-course-thumbnail.svg"),
    ],
)
def test_course_share_open_graph_preview_with_thumbnail(
    ml_client: TestClient,
    track: str,
    expected_thumb: str,
):
    resp = ml_client.get(f"/api/share/course/{track}")
    assert resp.status_code == 200, resp.text
    html_body = resp.text
    assert 'property="og:image"' in html_body
    assert expected_thumb in html_body
    assert 'name="twitter:card" content="summary_large_image"' in html_body
    assert f"/app/lms/{track}" in html_body

    bad_resp = ml_client.get("/api/share/course/unknown-track")
    assert bad_resp.status_code == 404
