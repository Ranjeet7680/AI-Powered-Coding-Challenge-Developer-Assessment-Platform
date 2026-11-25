import os
import sys
import tempfile
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Ensure backend package is importable
BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

# Use isolated temporary SQLite DB for tests
_TEST_DB_FD, _TEST_DB_PATH = tempfile.mkstemp(prefix="ctf_test_", suffix=".db")
os.close(_TEST_DB_FD)
os.environ["DATABASE_URL"] = f"sqlite:///{_TEST_DB_PATH}"
os.environ["JWT_SECRET_KEY"] = "test-suite-ephemeral-signing-key"

from app.database import Base, get_db, engine as app_engine, ensure_schema_migrations  # noqa: E402
from app.main import app  # noqa: E402
from app.routers import auth as auth_router  # noqa: E402
from app.routers import challenges as challenges_router  # noqa: E402
from app.routers import assessments as assessments_router  # noqa: E402
from app.routers import videos as videos_router  # noqa: E402

test_engine = create_engine(
    f"sqlite:///{_TEST_DB_PATH}",
    connect_args={"check_same_thread": False},
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="module", autouse=True)
def setup_database():
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)
    ensure_schema_migrations(test_engine)
    db = TestingSessionLocal()
    try:
        challenges_router.seed_initial_challenges(db)
        assessments_router.seed_assessments(db)
        videos_router.seed_videos(db)
    finally:
        db.close()
    yield
    test_engine.dispose()
    app_engine.dispose()
    try:
        if os.path.exists(_TEST_DB_PATH):
            os.remove(_TEST_DB_PATH)
    except OSError:
        pass


@pytest.fixture()
def client():
    auth_router.FAILED_ATTEMPTS.clear()
    with TestClient(app) as c:
        yield c


def _register_and_headers(client: TestClient, email: str, password: str = "StrongPass#2026!"):
    res = client.post(
        "/api/auth/register",
        json={"email": email, "password": password, "full_name": "Test Engineer"},
    )
    assert res.status_code == 201, res.text
    data = res.json()
    return {"Authorization": f"Bearer {data['token']}"}, data["user"]


def test_health_and_capabilities(client: TestClient):
    res = client.get("/api/health")
    assert res.status_code == 200
    body = res.json()
    assert body["status"] == "ok"
    assert "runtimes" in body
    assert body["runtimes"]["python"] is True


def test_auth_lifecycle_and_password_policy(client: TestClient):
    weak = client.post(
        "/api/auth/register",
        json={"email": "weak@example.com", "password": "short", "full_name": "Weak"},
    )
    assert weak.status_code == 400

    headers, user = _register_and_headers(client, "alice@example.com")
    assert user["email"] == "alice@example.com"
    assert user["has_gemini_api_key"] is False

    assert client.get("/api/auth/me").status_code == 401

    me = client.get("/api/auth/me", headers=headers)
    assert me.status_code == 200
    assert me.json()["email"] == "alice@example.com"

    cp = client.post(
        "/api/auth/change-password",
        headers=headers,
        json={"current_password": "StrongPass#2026!", "new_password": "NewStrong#Pass2026!"},
    )
    assert cp.status_code == 200

    assert (
        client.post(
            "/api/auth/login",
            json={"email": "alice@example.com", "password": "StrongPass#2026!"},
        ).status_code
        == 401
    )
    ok_login = client.post(
        "/api/auth/login",
        json={"email": "alice@example.com", "password": "NewStrong#Pass2026!"},
    )
    assert ok_login.status_code == 200

    prof = client.put(
        "/api/user/profile",
        headers=headers,
        json={"gemini_api_key": "AIzaSyTestSecretKey9876"},
    )
    assert prof.status_code == 200
    prof_json = prof.json()
    assert prof_json["has_gemini_api_key"] is True
    assert prof_json["gemini_api_key_preview"].endswith("9876")
    assert "gemini_api_key" not in prof_json


def test_multilang_code_execution(client: TestClient):
    # Unauthenticated run-code should be rejected
    unauth = client.post(
        "/api/run-code",
        json={"language": "python", "code": "print(42)", "test_cases": []},
    )
    assert unauth.status_code == 401

    headers, _ = _register_and_headers(client, "runner@example.com")

    # Python
    py_res = client.post(
        "/api/run-code",
        headers=headers,
        json={
            "language": "python",
            "code": "import sys\nprint(int(sys.stdin.read().strip()) * 2)",
            "test_cases": [{"input": "21", "expected_output": "42", "is_hidden": False}],
        },
    )
    assert py_res.status_code == 200
    assert py_res.json()["status"] == "Accepted"

    # JavaScript
    js_res = client.post(
        "/api/run-code",
        headers=headers,
        json={
            "language": "javascript",
            "code": "const fs=require('fs'); console.log(Number(fs.readFileSync(0,'utf8').trim())+1);",
            "test_cases": [{"input": "41", "expected_output": "42", "is_hidden": False}],
        },
    )
    assert js_res.status_code == 200
    assert js_res.json()["status"] == "Accepted"

    # TypeScript
    ts_res = client.post(
        "/api/run-code",
        headers=headers,
        json={
            "language": "typescript",
            "code": "import * as fs from 'node:fs';\nconst add = (a: number, b: number): number => a + b;\nconst n: number = parseInt(fs.readFileSync(0, 'utf8').trim(), 10);\nconsole.log(add(n, 10));",
            "test_cases": [{"input": "32", "expected_output": "42", "is_hidden": False}],
        },
    )
    assert ts_res.status_code == 200
    assert ts_res.json()["status"] == "Accepted"

    # C++
    cpp_res = client.post(
        "/api/run-code",
        headers=headers,
        json={
            "language": "cpp",
            "code": "#include <iostream>\nint main(){ int x; std::cin >> x; std::cout << x*2 << std::endl; return 0; }",
            "test_cases": [{"input": "5", "expected_output": "10", "is_hidden": False}],
        },
    )
    assert cpp_res.status_code == 200
    assert cpp_res.json()["status"] in ("Accepted", "Compilation Error")


def test_challenges_submissions_analytics_and_assessments(client: TestClient):
    headers, _ = _register_and_headers(client, "bob@example.com")

    km = client.get("/api/challenges/c-ml-kmeans")
    assert km.status_code == 200
    assert "python" in km.json()["starter_code"]
    assert "typescript" in km.json()["starter_code"]

    two_sum_code = """import sys
raw = sys.stdin.read().split()
target = int(raw[0])
nums = [int(x) for x in raw[1:]]
seen = {}
for i, v in enumerate(nums):
    if target - v in seen:
        print(f"{seen[target - v]} {i}")
        break
    seen[v] = i
"""
    sub1 = client.post(
        "/api/submit-solution",
        headers=headers,
        json={"challenge_id": "c1-two-sum", "language": "python", "code": two_sum_code},
    )
    assert sub1.status_code == 200
    sub1_data = sub1.json()
    assert sub1_data["status"] == "Accepted"
    assert sub1_data["score"] == 100
    assert "time_complexity" in sub1_data["ai_feedback"]

    me_after_first = client.get("/api/auth/me", headers=headers).json()
    assert me_after_first["solved_count"] == 1
    assert me_after_first["points"] == 1250

    sub2 = client.post(
        "/api/submit-solution",
        headers=headers,
        json={"challenge_id": "c1-two-sum", "language": "python", "code": two_sum_code},
    )
    assert sub2.status_code == 200
    me_after_second = client.get("/api/auth/me", headers=headers).json()
    assert me_after_second["solved_count"] == 1
    assert me_after_second["points"] == 1260

    analytics = client.get("/api/analytics", headers=headers)
    assert analytics.status_code == 200
    assert "Python" in analytics.json()["language_breakdown"]

    lb_all = client.get("/api/leaderboard?period=all", headers=headers)
    lb_weekly = client.get("/api/leaderboard?period=weekly", headers=headers)
    assert lb_all.status_code == 200 and lb_weekly.status_code == 200
    assert any(row.get("is_current_user") for row in lb_all.json())

    gen_dp = client.post(
        "/api/generate-challenge",
        headers=headers,
        json={"topic": "Dynamic Programming", "difficulty": "Hard", "test_case_count": 4},
    )
    assert gen_dp.status_code == 200
    assert len(gen_dp.json()["test_cases"]) == 4

    gen_ml = client.post(
        "/api/generate-challenge",
        headers=headers,
        json={"topic": "Machine Learning", "difficulty": "Medium", "test_case_count": 3},
    )
    assert gen_ml.status_code == 200
    assert gen_ml.json()["title"] != gen_dp.json()["title"]

    copilot = client.post(
        "/api/ai-copilot",
        headers=headers,
        json={
            "message": "What is my time complexity?",
            "challenge_title": "Two Sum Optimal",
            "language": "python",
            "code": two_sum_code,
        },
    )
    assert copilot.status_code == 200
    assert "O(" in copilot.json()["reply"]

    comp = client.post(
        "/api/assessments/as-faang-1/complete",
        headers=headers,
        json={"score": 90, "solved_challenge_ids": ["c1-two-sum"], "elapsed_seconds": 600},
    )
    assert comp.status_code == 200
    comp_data = comp.json()
    assert comp_data["passed"] is True
    assert comp_data["certificate"] is not None
    assert comp_data["certificate"]["credential_id"].startswith("CTF-")
    assert comp_data["certificate"]["score_percent"] == 90
    assert len(comp_data["certificate"]["skills_verified"]) >= 3
    assert len(comp_data["certificate"]["credential_hash"]) == 64


def test_challenge_bank_scale_stats_and_execution(client: TestClient):
    headers, _ = _register_and_headers(client, "bank@example.com")

    all_res = client.get("/api/challenges")
    assert all_res.status_code == 200
    items = all_res.json()
    assert len(items) >= 360
    assert len({c["id"] for c in items}) == len(items)
    assert len({c["slug"] for c in items}) == len(items)

    stats_res = client.get("/api/challenges/stats")
    assert stats_res.status_code == 200
    stats = stats_res.json()
    assert stats["total"] == len(items)
    assert sum(stats["by_difficulty"].values()) == stats["total"]
    assert len(stats["by_category"]) >= 10

    page1 = client.get("/api/challenges?limit=15&offset=0").json()
    page2 = client.get("/api/challenges?limit=15&offset=15").json()
    assert len(page1) == 15
    assert len(page2) == 15
    assert {c["id"] for c in page1}.isdisjoint({c["id"] for c in page2})

    for sample_id in ("ctf-001", "ctf-120", "ctf-240", "ctf-360"):
        ch = client.get(f"/api/challenges/{sample_id}").json()
        for lang in ("python", "javascript", "typescript", "cpp"):
            assert lang in ch["starter_code"] and len(ch["starter_code"][lang]) > 20
        run = client.post(
            "/api/run-code",
            headers=headers,
            json={
                "language": "python",
                "code": ch["starter_code"]["python"],
                "challenge_id": sample_id,
            },
        )
        assert run.status_code == 200
        assert run.json()["status"] == "Accepted", (sample_id, run.json())


def test_certificates_detailing_verify_and_pdf(client: TestClient):
    headers, _ = _register_and_headers(client, "certpro@example.com")

    certs_res = client.get("/api/certificates", headers=headers)
    assert certs_res.status_code == 200
    certs = certs_res.json()
    assert len(certs) >= 3

    first = certs[0]
    assert first["issuer_name"] == "Coding Task Factory Academy"
    assert first["signatory_name"] == "Dr. Aris Thorne"
    assert first["score_percent"] >= 90
    assert len(first["skills_verified"]) >= 3
    assert first["challenges_completed"] >= 1
    assert first["completion_hours"] >= 1
    assert first["credential_hash"] and len(first["credential_hash"]) == 64

    cred_id = first["credential_id"]

    # Public verification endpoint (no auth required)
    verify_res = client.get(f"/api/certificates/{cred_id}/verify")
    assert verify_res.status_code == 200
    v_data = verify_res.json()
    assert v_data["verified"] is True
    assert v_data["credential_id"] == cred_id
    assert v_data["verification_url"] == f"/verify/{cred_id}"

    # Vector PDF generation endpoint
    pdf_res = client.get(f"/api/certificates/{cred_id}/pdf")
    assert pdf_res.status_code == 200
    assert pdf_res.headers["content-type"] == "application/pdf"
    assert f"CodingTaskFactory-{cred_id}.pdf" in pdf_res.headers.get("content-disposition", "")
    assert pdf_res.content.startswith(b"%PDF-")
    assert len(pdf_res.content) > 2000

