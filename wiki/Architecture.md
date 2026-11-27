<div align="center">
  <img src="../docs/assets/wiki-header.svg" alt="Coding Task Factory Architecture Wiki Banner" width="100%" />
</div>

# System Architecture & Database Schema

[← Back to Wiki Home](Home.md)

---

## Full-Stack System Topology

The web platform separates a **code-split React 19 Graphite Workbench SPA** from a **stateless JWT-authenticated FastAPI backend**, backed by SQLAlchemy + SQLite with idempotent runtime column migrations (`ensure_schema_migrations`).

```mermaid
flowchart TB
  subgraph Client["Frontend Layer (React 19 + TypeScript + Vite)"]
    Router["React Router v7 Lazy Routes (26 Views)"]
    Landing["LandingPage + CodeGlyphField Canvas"]
    IDE["WorkspacePage & Monaco Editor"]
    Academies["5 Academies (230 Lectures: ML, DL, DS, IITM Biz, Agentic AI) + CourseShare + Proctor"]
    CertsUI["CertificatesPage & Share Studio"]
    VerifyUI["Public Verify (/verify/:id) & OG Course Share (/share/course/:track)"]
    Search["GlobalSearchModal (Ctrl+K)"]
    CanvasPNG["HTML5 Canvas PNG Exporters (certificateShare.ts & courseShare.ts)"]
  end

  subgraph API["FastAPI Backend (backend/app/main.py)"]
    AuthR["auth.py & user.py"]
    ChalR["challenges.py (Stats & Paginated Bank)"]
    ExecR["execution.py (Run, Submit, AI Copilot)"]
    GenR["ai_generator.py (Gemini & Fallbacks)"]
    CourseR["ml_course.py & videos.py (5 LMS Routers, Proctor, OG Share, Playlists)"]
    AssessR["assessments.py, analytics.py & submissions.py"]
    CertR["Public /verify & /pdf Endpoints"]
  end

  subgraph Services["Core Engines (backend/app/services/)"]
    Runner["code_runner.py (PY, JS, TS, CPP20 JsonCpp)"]
    Bank["challenge_bank.py (360 Synthesized Tasks)"]
    Catalog["course_catalog_shared.py · ml/dl/ds/biz/agentic catalogs · video_library.py"]
    Gemini["gemini_service.py (LLM + Procedural AST Fallback)"]
    PDF["pdf_certificate.py (ReportLab Landscape A4 Vector PDF)"]
  end

  subgraph Storage["Persistence Layer"]
    DB["SQLite / SQLAlchemy (models.py + database.py)"]
  end

  Router --> Landing & IDE & Academies & CertsUI & VerifyUI & Search
  CertsUI --> CanvasPNG
  IDE --> ExecR
  Academies --> CourseR
  CertsUI --> AssessR & CertR
  VerifyUI --> CertR

  AuthR & ChalR & AssessR & CourseR & CertR --> DB
  ExecR --> Runner & Gemini & DB
  GenR --> Gemini
  ChalR --> Bank
  CourseR --> Catalog
  CertR --> PDF
```

---

## Frontend UI System (Graphite & Signal Amber Workbench)

All 22 frontend pages and shared layout shells follow a unified architectural specification:

- **Surface Hierarchy (`frontend/src/index.css`)**: Deepest rail `#0f0f10`, Canvas `#141415`, Card `#19191b`, Raised `#222225`, separated by `1px` low-contrast hairlines (`rgba(237, 237, 237, 0.08)`) with zero ambient glow blurs.
- **Typography & Tabular Discipline (`frontend/index.html`)**: `IBM Plex Sans` (weights `400`, `500`, `600`) paired with `IBM Plex Mono` (`400`, `500`) and `.tabular-nums` on every metric, countdown, rank, and table cell.
- **Accent & Semantics**: Monochrome primary action surface (`#ededed` text on `#141415` or inverse dark button), single **Signal Amber (`#e5a00d`)** focal accent for primary chart trajectories and active markers, `#4cc38a` positive, and `#e5484d` error/negative.
- **Pure-Code Visuals**: Interactive `CodeGlyphField.tsx` ASCII glyph backdrop and live interactive `lru_cache` code preview (`LandingPage.tsx`), flat drafted `< / >` vector mark (`BrandLogo.tsx`, `favicon.svg`, `logo.svg`, `og-card.svg`), and Graphite-themed Recharts & SVG curriculum thumbnails (`ml-ctf-course-thumbnail.svg`, `stanford-ctf-dl-thumbnail.svg`).

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

---

## Multi-Environment Deployment, C++20 JsonCpp & CI/CD Architecture

Shows how the platform deploys consistently across Local/Docker sandboxes (including C++20 `open-source-parsers/jsoncpp`), GitHub Actions CI + live Wiki mirror, and Vercel Edge/Serverless production.

```mermaid
flowchart LR
  subgraph LocalDocker["1. Local & Container Sandbox"]
    DEV["Local Dev / CLI<br/>uvicorn · vite · run_factory.py"]
    DOCK["Dockerfile Runtime<br/>Python 3.11 · g++ C++20 · cmake"]
    JSON["Vendored JsonCpp<br/>backend/vendor/jsoncpp + libjsoncpp.a"]
  end

  subgraph CI["2. GitHub Actions CI & Live Wiki"]
    GHA[".github/workflows/ci.yml<br/>oxlint · tsc · pytest (15/15) · vite build"]
    WIKI[".wiki.git Mirror<br/>Live GitHub Wiki Pages + SVG Assets"]
  end

  subgraph Prod["3. Vercel Cloud Production"]
    CDN["Edge CDN (frontend/dist)<br/>React 19 SPA · Monaco · /wiki"]
    API["Serverless Python (/api/index.py)<br/>FastAPI · ReportLab PDFs · /api/health"]
  end

  DEV & DOCK & JSON --> GHA
  GHA --> CDN & API & WIKI
```
