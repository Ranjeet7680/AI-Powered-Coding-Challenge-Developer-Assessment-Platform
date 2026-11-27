<div align="center">
  <img src="../docs/assets/wiki-header.svg" alt="ML and DL Academy LMS Wiki Banner" width="100%" />
</div>

# 5 LMS Academies (230 Lectures), Course Thumbnail Share & AI Proctoring Architecture

[← Back to Wiki Home](Home.md) · [Proposed Solution Arch & Wireframes →](Proposed-Solution-Architecture-and-Wireframes.md)

---

## Architecture Overview & 5-Track Ecosystem

<div align="center">
  <img src="../docs/assets/ml-lms-big-diagrams.svg" alt="3 Big Diagrams for LMS Academies, AI Camera Proctoring, and Curriculum Telemetry Architecture" width="100%" />
</div>

---

### Big Diagram 1: End-to-End 9-Stage Multi-Track LMS Progression & Course Thumbnail Sharing

Documents the shared page-by-page classroom lifecycle powered by [`courseTracks.ts`](../frontend/src/constants/courseTracks.ts), [`LMSHubPage.tsx`](../frontend/src/pages/LMSHubPage.tsx), [`CourseDetailPage.tsx`](../frontend/src/pages/CourseDetailPage.tsx), [`MLCoursePage.tsx`](../frontend/src/pages/MLCoursePage.tsx), [`CourseShareButton.tsx`](../frontend/src/components/lms/CourseShareButton.tsx), [`CourseEndToEndPanels.tsx`](../frontend/src/components/lms/CourseEndToEndPanels.tsx), and [`CourseAdvancedPanels.tsx`](../frontend/src/components/lms/CourseAdvancedPanels.tsx).

```mermaid
flowchart LR
  S1["01 · LMS Courses Hub<br/>(/app/lms · 5 Active Tracks)"] --> S2["02 · Course Detail & Syllabus<br/>(/app/lms/:track · Share w/ Thumbnail)"]
  S2 --> S3["03 · Lecture Theater<br/>(Step 1: Watch In-LMS Video<br/>Step 2: Notes & Code · +15 XP)"]
  S3 --> S4["04 · Practice Quiz Bank<br/>(230+ Curriculum MCQs)"]
  S4 --> S5["05 · Capstone Project Lab<br/>(Rubric-Graded Modeling & Code)"]
  S5 --> S6["06 · Proctored Final Exam<br/>(14–35 Timed Qs · AI Camera Guard)"]
  S6 --> S7["07 · Feedback Survey<br/>(5-Star Rating & Review)"]
  S7 --> S8["08 · Verified PDF Certificate<br/>(ReportLab A4 · SHA-256 · QR + Social)"]
  S8 --> S9["09 · Goodies Form & Done!<br/>(Swag Claim & Completion Milestone)"]

  S2 -. "CourseShareButton (PNG + OG /share/course/:track)" .-> Share["1280×720 Thumbnail Export<br/>LinkedIn / WhatsApp / X"]
```

---

### Big Diagram 2: MediaPipe AI Camera Proctor & 4-Tier Anti-Cheat Vision Pipeline

Documents the browser-side computer-vision proctoring engine implemented inside [`ProctorCameraGuard.tsx`](../frontend/src/components/lms/ProctorCameraGuard.tsx) and [`proctorVision.ts`](../frontend/src/components/lms/proctorVision.ts).

```mermaid
flowchart TB
  Webcam["Webcam Stream (640x360 Canvas)<br/>Luminance · YCbCr Skin Ratio · Frame Motion"] --> Cascade{"4-Tier Vision Engine<br/>(ensureProctorVisionReady)"}

  Cascade -->|"Tier 1: Best"| T1["mediapipe-full<br/>BlazeFace FaceDetector +<br/>COCO EfficientDet-Lite0 (/proctor/)"]
  Cascade -->|"Tier 2"| T2["mediapipe-face<br/>BlazeFace Keypoints & Yaw Gaze"]
  Cascade -->|"Tier 3"| T3["browser-face<br/>Native window.FaceDetector API"]
  Cascade -->|"Tier 4: Fallback"| T4["skin-cv<br/>YCbCr Lens Block & Frozen-Frame Check"]

  T1 & T2 & T3 & T4 --> Signals["Violation Classifiers<br/>• 0 Faces / &gt;1 Faces / Gaze Yaw Away<br/>• Prohibited Objects: phone, book, laptop, tv<br/>• Lens Covered / Frozen Frame"]

  BrowserEvents["DOM & Window Hooks<br/>Tab Switch · Window Blur · Fullscreen Exit<br/>Copy/Paste · Right-Click · DevTools Guard"] --> Strikes
  Signals --> Strikes["Strike Manager (0/3 to 3/3 Strikes)<br/>HUD Overlay + Audio Alert + Violation Log"]

  Strikes -->|"&lt; 3 Strikes"| Resume["Continue Proctored Exam"]
  Strikes -->|"3 Strikes Reached"| Lock["onMaxViolationsReached()<br/>Auto-Lock & Submit Audit Log"]
```

---

### Big Diagram 3: 5-Academy Curriculum (`230` Lectures), Shared Catalog Engine & FastAPI Telemetry Architecture

Documents the 5 structured certification tracks, Video Masterclasses theater, and the parameterized FastAPI / SQLite backend (`api.courseLms('ml' | 'dl' | 'ds' | 'biz' | 'agentic')` + `/api/share/course/{track}`).

```mermaid
flowchart TB
  subgraph Tracks["5 Certified Academy LMS Tracks (230 Lectures Total)"]
    ML["Machine Learning Mastery<br/>106 Lectures · 7 Modules"]
    DL["Stanford × CTF Deep Learning<br/>21 Lectures · 4 Modules"]
    DS["Python Data Science & Big Data<br/>14 Lectures · 3 Modules"]
    BIZ["IIT Madras × CTF Business Fundamentals<br/>66 Lectures · 6 Modules"]
    AG["Agentic AI & MCP Engineering<br/>23 Lectures · 4 Modules"]
  end

  subgraph Share["Thumbnail & Social Sharing"]
    OG["/share/course/:track -> /api/share/course/:track<br/>OG/Twitter Meta Preview + 1280×720 SVG/PNG"]
  end

  subgraph API["FastAPI Parameterized LMS & Credential Engine"]
    LMSAPI["course_catalog_shared.py + ml_course.py<br/>Progress · Quiz Banks · Capstones · Proctor Exam · Reviews · Swag"]
    DB["SQLite Persistence + ReportLab Vector PDF<br/>SHA-256 Verification (/verify/:id)"]
  end

  Tracks --> LMSAPI --> DB
  Tracks --> OG
```

---

## Complete Academy Module Matrix

| Track | Modules | Lectures & Assessments | Proctoring & Output |
| :--- | :---: | :--- | :--- |
| **Applied ML Course LMS** (`/ml-course`) | **7 Modules** | 106 lectures, 100+ quizzes, 3 capstones, 35-question exam | Live MediaPipe AI camera + 3-strike lock + `CTF-ML-` PDF & swag |
| **Stanford × CTF Deep Learning** (`/dl-course`) | **4 Modules** | 21 CS229 lectures, study notes, 20+ quizzes, 3 capstones, 20-Q exam | Proctored exam + feedback + `CTF-DL-` PDF certificate |
| **Python Data Science & Big Data** (`/ds-course`) | **3 Modules** | 14 lectures (Jupyter, NumPy, Pandas, CSV/JSON, Matplotlib), 14 quizzes, 3 capstones, 14-Q exam | Proctored exam + `CTF-DS-` PDF certificate + PNG share |
| **IIT Madras × CTF Business Fundamentals** (`/biz-course`) | **6 Modules** | 66 lectures (Viz, Bayes, Elasticity, VIF, DEA frontiers, Conjoint), 66 quizzes, 3 capstones, 30-Q exam | Proctored exam + `CTF-BIZ-` PDF certificate + PNG share |
| **Agentic AI & MCP Engineering** (`/agentic-course`) | **4 Modules** | 23 lectures (Reflex/RL Agents, LangGraph, CrewAI, Agno RAG, Custom MCP, OpenAI SDK), 23 quizzes, 3 capstones, 20-Q exam | Proctored exam + `CTF-AG-` PDF certificate + PNG share |
| **Video Masterclasses Hub** (`/videos`) | **8 Playlists** | 596 embedded playlists with platform video theater & direct share | Linked to coding challenges & all 5 Academy pathways |
