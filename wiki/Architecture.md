<div align="center">
  <img src="../docs/assets/wiki-header.svg" alt="Coding Task Factory Architecture Wiki Banner" width="100%" />
</div>

# System Architecture & Database Schema

[← Back to Wiki Home](Home.md)

---

## Full-Stack System Topology

The web platform separates a **code-split React 19 SPA** from a **stateless JWT-authenticated FastAPI backend**, backed by SQLAlchemy + SQLite with idempotent runtime column migrations (`ensure_schema_migrations`).

```mermaid
flowchart TB
  subgraph Client["Frontend Layer (React 19 + TypeScript + Vite)"]
    Router["React Router v7 Lazy Routes"]
    IDE["WorkspacePage & Monaco Editor"]
    Library["ChallengesPage (Pagination + Filters)"]
    CertsUI["CertificatesPage & Share Studio"]
    VerifyUI["Public VerifyCertificatePage (/verify/:id)"]
    Search["GlobalSearchModal (Ctrl+K)"]
    CanvasPNG["HTML5 Canvas PNG Exporter (certificateShare.ts)"]
  end

  subgraph API["FastAPI Backend (backend/app/main.py)"]
    AuthR["auth.py & user.py"]
    ChalR["challenges.py (Stats & Paginated Bank)"]
    ExecR["execution.py (Run, Submit, AI Copilot)"]
    GenR["ai_generator.py (Gemini & Fallbacks)"]
    AssessR["assessments.py & analytics.py"]
    CertR["Public /verify & /pdf Endpoints"]
  end

  subgraph Services["Core Engines (backend/app/services/)"]
    Runner["code_runner.py (PY, JS, TS, CPP Subprocess)"]
    Bank["challenge_bank.py (360 Synthesized Tasks)"]
    Gemini["gemini_service.py (LLM + Procedural AST Fallback)"]
    PDF["pdf_certificate.py (ReportLab Landscape A4 Vector PDF)"]
  end

  subgraph Storage["Persistence Layer"]
    DB["SQLite / SQLAlchemy (models.py + database.py)"]
  end

  Router --> IDE & Library & CertsUI & VerifyUI & Search
  CertsUI --> CanvasPNG
  IDE --> ExecR
  Library --> ChalR
  CertsUI --> AssessR & CertR
  VerifyUI --> CertR

  AuthR & ChalR & AssessR & CertR --> DB
  ExecR --> Runner & Gemini & DB
  GenR --> Gemini
  ChalR --> Bank
  CertR --> PDF
```

---

## Database Entity-Relationship Schema

All relational models are defined in [`backend/app/models.py`](../backend/app/models.py) with automatic additive SQLite migrations handled on startup via `ensure_schema_migrations()` in [`backend/app/database.py`](../backend/app/database.py).

```mermaid
erDiagram
  USER ||--o{ SUBMISSION : submits
  USER ||--o{ CERTIFICATE : earns
  CHALLENGE ||--o{ SUBMISSION : receives
  ASSESSMENT ||--o{ CERTIFICATE : awards

  USER {
    string id PK
    string email UK
    string hashed_password
    string full_name
    string role
    string experience
    json preferred_languages
    json goals
    string gemini_api_key
    int points
    int streak
    int solved_count
    boolean has_completed_onboarding
  }

  CHALLENGE {
    string id PK
    string title
    string slug UK
    text description
    string difficulty
    string category
    string problem_type
    int time_limit_ms
    int memory_limit_mb
    json starter_code
    json test_cases
    json expected_complexity
    float acceptance_rate
    int total_submissions
  }

  SUBMISSION {
    string id PK
    string user_id FK
    string challenge_id FK
    string language
    text code
    string status
    float runtime_ms
    int test_cases_passed
    int total_test_cases
    int score
    json ai_feedback
  }

  ASSESSMENT {
    string id PK
    string title
    int duration_minutes
    int passing_score
    json challenge_ids
    string category
    int candidates_count
  }

  CERTIFICATE {
    string id PK
    string user_id FK
    string title
    string recipient_name
    datetime issue_date
    string credential_id UK
    string grade
    string issuer_name
    string signatory_name
    string signatory_title
    int score_percent
    json skills_verified
    int challenges_completed
    int completion_hours
    text summary
    string credential_hash
  }

  VIDEO_LESSON {
    string id PK
    string title
    string slug UK
    string category
    int duration_minutes
    string instructor
    string related_challenge_id
    json chapters
  }
```
