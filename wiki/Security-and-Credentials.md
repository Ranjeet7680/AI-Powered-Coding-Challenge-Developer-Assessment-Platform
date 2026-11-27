<div align="center">
  <img src="../docs/assets/wiki-header.svg" alt="Coding Task Factory Security and Credentials Wiki" width="100%" />
</div>

# Zero-Trust Security, ReportLab PDF & Social Credentials

[← Back to Wiki Home](Home.md)

---

## Zero-Trust Authentication & Account Shield Sequence

Authentication logic in [`backend/app/routers/auth.py`](../backend/app/routers/auth.py) enforces strict password strength, per-user salted PBKDF2 derivation, constant-time signature comparison, failed-attempt rate lockouts, and masked API key serialization in [`backend/app/routers/user.py`](../backend/app/routers/user.py).

```mermaid
sequenceDiagram
  actor Dev as Developer
  participant UI as React Client
  participant Auth as FastAPI Auth Router
  participant Sec as PBKDF2 & Brute-Force Shield
  participant DB as SQLite User Store

  Dev->>UI: Enter email + password
  UI->>Auth: POST /api/auth/login or /register
  Auth->>Sec: Check brute-force lockout map (5 tries / 15 min)
  alt Account Locked
    Sec-->>Auth: Lockout active
    Auth-->>UI: 429 Too Many Requests
  else Allowed
    Auth->>DB: Query User by normalized email
    Auth->>Sec: Verify 100,000-round PBKDF2-HMAC-SHA256 via hmac.compare_digest
    alt Valid Password
      Sec-->>Auth: Sign HS256 JWT (7-day exp, jti claim)
      Auth-->>UI: 200 OK { token, user with masked gemini_api_key_preview }
    else Invalid Password
      Sec->>Sec: Record attempt timestamp
      Auth-->>UI: 401 Generic invalid credentials error
    end
  end
```

---

## Certificate Lifecycle: ReportLab PDF, Public Verification & Social Studio

Credentials follow a deterministic cryptographic pipeline across [`backend/app/routers/assessments.py`](../backend/app/routers/assessments.py), [`backend/app/routers/analytics.py`](../backend/app/routers/analytics.py), [`backend/app/services/pdf_certificate.py`](../backend/app/services/pdf_certificate.py), and [`frontend/src/utils/certificateShare.ts`](../frontend/src/utils/certificateShare.ts).

```mermaid
sequenceDiagram
  actor Dev as Candidate / Recruiter
  participant App as CertificatesPage / AssessmentsPage
  participant API as FastAPI Analytics & Verify API
  participant PDF as ReportLab Vector Generator
  participant Verify as Public /verify/:credentialId

  Dev->>App: Pass Assessment or Open Credentials Hub
  App->>API: POST /api/assessments/{id}/complete or GET /api/certificates
  API-->>App: Certificate (score_percent, skills_verified, challenges_completed, SHA-256 hash)

  par Vector PDF Export
    Dev->>App: Click Download Official PDF
    App->>API: GET /api/certificates/{credential_id}/pdf
    API->>PDF: generate_certificate_pdf(cert)
    PDF-->>App: Landscape A4 PDF Bytes (%PDF- stream + 15x15 QR Matrix + Signature)
  and Public Recruiter Verification
    Dev->>Verify: Open /verify/{credential_id}
    Verify->>API: GET /api/certificates/{credential_id}/verify
    API-->>Verify: Verified status + issuer + signatory + skills + hash
  and Social Post Studio
    Dev->>App: Open Share & Post Studio Tab
    App-->>Dev: Editable Post Templates (LinkedIn, Instagram, Facebook, WhatsApp)
    App-->>Dev: Graphite HTML5 Canvas PNG Cards (1080x1080 IG Square / 1200x630 Landscape)
  end
```

---

## Supported Social Share Outputs

| Channel | Copyable Message Template | Graphic Attachment | Direct Action Deep-Link |
| :--- | :--- | :--- | :--- |
| **LinkedIn** | Career milestone post, score, verified skills, verify link & hashtags | `1200×630` PNG Card | **Post on Feed** (`linkedin.com/feed/?shareActive=true`) & **Add License/Cert** (`linkedin.com/profile/add`) |
| **Instagram** | Caption with metrics, skill stack & hashtag set | `1080×1080` Square PNG Card | **Download 1080×1080 Card** + Copy & Open Instagram |
| **Facebook** | Conversational milestone announcement + credential link | `1200×630` Landscape PNG Card | **Share on Facebook** (`facebook.com/sharer/sharer.php`) |
| **WhatsApp** | Clean `*bold*` status/DM summary + `\`credential_id\`` | Official Vector PDF | **Send via WhatsApp** (`https://wa.me/?text=...`) |
