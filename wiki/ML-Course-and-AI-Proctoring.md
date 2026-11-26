<div align="center">
  <img src="../docs/assets/wiki-header.svg" alt="ML and DL Academy LMS Wiki Banner" width="100%" />
</div>

# Machine Learning (106) & Stanford DL (21) LMS + AI Proctoring Architecture

[← Back to Wiki Home](Home.md) · [Proposed Solution Arch & Wireframes →](Proposed-Solution-Architecture-and-Wireframes.md)

---

## 3 Big ML & AI Proctoring Architecture Diagrams

<div align="center">
  <img src="../docs/assets/ml-lms-big-diagrams.svg" alt="3 Big Diagrams for ML LMS, AI Camera Proctoring, and Curriculum Telemetry Architecture" width="100%" />
</div>

---

### Big Diagram 1: End-to-End 9-Stage ML & Deep Learning LMS Progression

Documents the complete page-by-page learning lifecycle across [`LMSHubPage.tsx`](../frontend/src/pages/LMSHubPage.tsx), [`CourseDetailPage.tsx`](../frontend/src/pages/CourseDetailPage.tsx), [`MLCoursePage.tsx`](../frontend/src/pages/MLCoursePage.tsx), [`CourseEndToEndPanels.tsx`](../frontend/src/components/lms/CourseEndToEndPanels.tsx), and [`CourseAdvancedPanels.tsx`](../frontend/src/components/lms/CourseAdvancedPanels.tsx).

```mermaid
flowchart LR
  S1["01 · LMS Courses Hub<br/>(/app/lms · ML & DL Tracks)"] --> S2["02 · Course Detail & Syllabus<br/>(/app/course/ml or /app/course/dl)"]
  S2 --> S3["03 · Lecture Theater<br/>(Step 1: Watch In-LMS Video<br/>Step 2: Notes & Code · +15 XP)"]
  S3 --> S4["04 · Practice Quiz Bank<br/>(Step 3: 100+ ML / 20+ DL MCQs)"]
  S4 --> S5["05 · Capstone Project Lab<br/>(Hands-on Model & Code Grading)"]
  S5 --> S6["06 · Proctored Final Exam<br/>(35 Timed Qs · AI Camera Guard)"]
  S6 --> S7["07 · Feedback Survey<br/>(5-Star Rating & Review)"]
  S7 --> S8["08 · Verified PDF Certificate<br/>(ReportLab A4 · SHA-256 · QR + Social)"]
  S8 --> S9["09 · Goodies Form & Done!<br/>(Swag Claim & Completion Milestone)"]

  S3 -. "Next Lecture / Next Quiz" .-> S4
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

### Big Diagram 3: Applied ML (106 Lectures) & Stanford DL (21) Curriculum & Backend Telemetry Architecture

Documents the 7 ML modules, 4 Stanford DL CS229 modules, Video Masterclasses theater, and the FastAPI / SQLite backend API (`api.courseLms('ml' | 'dl')`).

```mermaid
flowchart TB
  subgraph MLTrack["Applied Machine Learning LMS (106 Lectures · 7 Modules)"]
    M1["M1 (1–8): ML Fundamentals & Metrics"]
    M2["M2 (9–29): Linear & Logistic Regression"]
    M3["M3 (30–43): PCA, Clustering & Dim Reduction"]
    M4["M4 (44–54): Naive Bayes, Trees & Ensembles"]
    M5["M5 (55–75): Gradient Optimization & Boosting"]
    M6["M6 (76–90): Neural Networks & CNNs"]
    M7["M7 (91–106): Transformers, PyTorch & RL"]
  end

  subgraph DLTrack["Stanford × CTF Deep Learning (21 Lectures) & Video Hub"]
    DL1["CS229 Regression, GDA & Naive Bayes"]
    DL2["Margins, Kernels & Learning Theory"]
    DL3["Neural Nets, Backprop & Deep Learning"]
    DL4["Reinforcement Learning & MDPs"]
    VH["Video Masterclasses Hub (8 Playlists)<br/>InLMSVideoPlayer + Native Platform Share"]
  end

  subgraph API["FastAPI LMS Telemetry & Credential Engine"]
    LMSAPI["api.courseLms('ml' | 'dl')<br/>Progress · Quiz Answers · Capstone Grading<br/>Proctor Violation Logs · Reviews · Swag"]
    DB["SQLite Persistence + ReportLab PDF<br/>SHA-256 Verification (/verify/:id) + Social PNG"]
  end

  MLTrack & DLTrack --> LMSAPI --> DB
```

---

## ML & DL Module Matrix

| Track | Modules | Lectures & Assessments | Proctoring & Output |
| :--- | :---: | :--- | :--- |
| **Applied ML Course LMS** | **7 Modules** | 106 lectures, 100+ quizzes, 3 capstone labs, 35-question final exam | Live MediaPipe AI camera + 3-strike lock + PDF certificate & goodies |
| **Stanford × CTF Deep Learning** | **4 Modules** | 21 Stanford CS229 lectures, study notes, 20+ quizzes, capstone lab | Proctored final exam + feedback survey + verified credential |
| **Video Masterclasses Hub** | **8 Playlists** | Embedded playlists with platform video theater & direct link sharing | Linked directly to related coding challenges & LMS pathways |
