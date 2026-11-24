# AI-Powered Coding Challenge & Developer Assessment Platform 🚀
### Coding Task Factory & TaskForge Pipeline (Innodata AI Hackathon — Track 1)
*"Create. Code. Evaluate. Improve."*

[![Harbor Framework](https://img.shields.io/badge/Harbor-0.25.x-blue.svg)](https://github.com/avfoundation/harbor)
[![Validation Matrix](https://img.shields.io/badge/Validation%20Matrix-100%25%20Passed-emerald.svg)](validation_evidence/validation_summary.md)
[![Mutation Testing](https://img.shields.io/badge/Mutation%20Kill%20Rate-100.0%25-brightgreen.svg)](validation_evidence/mutation_summary.md)
[![Security Standard](https://img.shields.io/badge/Security-PBKDF2%20100k%20%7C%20HMAC--SHA256%20JWT-purple.svg)](backend/app/routers/auth.py)
[![License](https://img.shields.io/badge/License-MIT-lightgrey.svg)](LICENSE)

---

## 🌟 Executive Summary

This repository delivers a unified dual-capability submission for the **Innodata AI Hackathon**:

1. **Track 1 Automated Task Factory Pipeline (`TaskForge`)**:
   - An autonomous benchmark task synthesis engine that reads the chosen public starter repository (**`pallets/click`** at commit `934813e4d421071a1b3db3973c02fe2721359a6e`, v8.1.8) and continuously generates realistic, high-signal, SWE-bench-grade feature development task packages strictly compliant with the **Harbor 0.25 framework**.
   - **Zero Bug Fixes**: Tasks represent purely new feature development and behavioral evolutions.
   - **Clean Starting Foundation**: Builds from an unmodified release commit where 100% of upstream tests pass.
   - **5 Substantive Task Packages**: Exercising 5 distinct architectural subsystems of Click.
   - **Harbor 0.25 Linter**: **0 Errors, 0 Warnings** across all 5 packages.
   - **Automated Validation Matrix**: Baseline (`nop`) reward = **`0.0`**, Oracle (`oracle`) reward = **`1.0`** (100% pass).
   - **Mutation Testing Rigor**: **10 / 10 mutants killed (100.0% kill rate)** across deliberate fault injections.

2. **Coding Task Factory SaaS Web Application**:
   - A full-stack developer experience featuring a high-converting public landing page, an unhackable account security system, a 5-step onboarding wizard, and an authenticated desktop dashboard equipped with an interactive Monaco coding workspace, Google Gemini AI challenge synthesis, and automated Big-O complexity reviews.

---

## 🛡️ Unhackable Zero-Trust Account Security System

The platform features an enterprise-grade authentication and account security architecture designed according to **NIST SP 800-63B** and **OWASP Authentication Guidelines**:

```
[ User Input ] ──► [ Input Sanitization & Password Policy Enforcement ]
                             │
                             ▼
         [ Salted PBKDF2-HMAC-SHA256 (100,000 Rounds) ]
                             │
                             ▼
     [ Constant-Time Verification (hmac.compare_digest) ]
                             │
                             ▼
     [ Brute-Force Shield (15-Min Lockout after 5 Tries) ]
                             │
                             ▼
     [ Cryptographically Signed HMAC-SHA256 JWT Token (7-Day Exp) ]
```

- **Salted PBKDF2 Key Derivation**: Passwords hashed using per-user cryptographically random 16-byte salts (`secrets.token_hex(16)`) through 100,000 HMAC-SHA256 iterations. Immune to pre-computed rainbow tables and high-speed GPU cracking.
- **Timing-Attack Immune**: All password and token signature verifications execute in constant time via `hmac.compare_digest`, preventing timing-side-channel analysis.
- **Cryptographic JWT Tokens**: Tokens are signed with HMAC-SHA256 (`HS256`), containing payload claims (`sub`, `email`, `role`, `iat`, `exp`, `jti`) and validated for signature integrity and expiration on every request.
- **Brute-Force & Credential-Stuffing Defense**: Automatically locks accounts for 15 minutes after 5 consecutive failed login attempts. Returns generic authentication errors to prevent user enumeration.
- **Strict Password Policy**:
  - Minimum 10 characters length (up to 128 characters).
  - Requires uppercase (`[A-Z]`), lowercase (`[a-z]`), numeric (`[0-9]`), and special symbols (`[!@#$%^&*...]`).
  - Real-time interactive entropy meter with visual requirement checklist in the registration UI.

---

## 📊 Track 1 TaskForge Benchmark Scorecard

| Task Package ID | Click Subsystem Extended | Baseline (`nop`) | Oracle (`oracle`) | Regressions Clean | Mutation Kill Rate | Harbor Lint Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **`click-feature-command-aliases`** | Command Parsing & Dispatch (`core.py`) | `0.0` | `1.0` | Yes | 100% (2/2) | Pass (0 errors) |
| **`click-feature-json-help-export`** | Introspection & Formatting (`core.py`) | `0.0` | `1.0` | Yes | 100% (2/2) | Pass (0 errors) |
| **`click-feature-nested-envvar-prefix`** | Context & Environment Resolution (`core.py`) | `0.0` | `1.0` | Yes | 100% (2/2) | Pass (0 errors) |
| **`click-feature-parameter-deprecation`** | Parameter Lifecycle Management (`core.py`, `exceptions.py`) | `0.0` | `1.0` | Yes | 100% (2/2) | Pass (0 errors) |
| **`click-feature-password-minlen-validator`** | Parameter Validation & Terminal UI (`termui.py`, `core.py`) | `0.0` | `1.0` | Yes | 100% (2/2) | Pass (0 errors) |
| **OVERALL SYSTEM TOTALS** | **5 Separate Subsystems** | **0.0 (All)** | **1.0 (All)** | **100% Clean** | **10/10 (100.0%)** | **0 Errors / 0 Warnings** |

---

## 📁 Repository Directory Structure

```
├── task_packages/                                  # 5 Synthesized Harbor 0.25 Task Packages
│   ├── click-feature-command-aliases/
│   ├── click-feature-json-help-export/
│   ├── click-feature-nested-envvar-prefix/
│   ├── click-feature-parameter-deprecation/
│   └── click-feature-password-minlen-validator/
│       ├── instruction.md                          # Unambiguous requirement contract
│       ├── task.toml                               # Harbor metadata (schema v1.4, base_commit)
│       ├── solution/                               # solution.patch & solve.sh
│       ├── tests/                                  # test_feature.py, test.sh, fail/pass json
│       └── environment/                            # Dockerfile reproducing base commit
│
├── pipeline/                                       # Core TaskForge Pipeline Engine
│   ├── config.py                                   # Target repo config (pallets/click @ 934813e)
│   ├── feature_definitions.py                      # Substantive feature specifications
│   ├── package_builder.py                          # Harbor package synthesizer
│   ├── validator.py                                # Baseline vs Oracle matrix runner
│   └── mutation_tester.py                          # Fault injection testing harness
│
├── validation_evidence/                            # Inspectable Evidence & Audit Logs
│   ├── validation_report.json                      # Machine-readable matrix report
│   ├── validation_summary.md                       # Formatted validation scorecard
│   ├── mutation_report.json                        # Machine-readable mutation report
│   ├── mutation_summary.md                         # Mutation test summary
│   ├── baseline_logs/                              # Raw logs from Baseline (nop) passes
│   ├── oracle_logs/                                # Raw logs from Oracle (oracle) passes
│   └── mutation_logs/                              # Raw logs from 10 mutant evaluations
│
├── docs/                                           # Project Technical Documentation
│   ├── TECHNICAL_EXPLANATION.md                    # In-depth architectural explanation
│   └── WALKTHROUGH_DEMO.md                         # Video storyboard & script
│
├── demo_walkthrough.py                             # Automated 1-click walkthrough runner
├── validate_tasks.py                               # Automated validation matrix runner
├── run_mutation_testing.py                         # Automated mutation test runner
├── run_factory.py                                  # Factory package generator
│
├── backend/                                        # FastAPI Application Server & Execution Sandbox
└── frontend/                                       # React 19 + TypeScript + Vite Desktop Workspace
```

---

## ⚡ Quick Start & Judging Verification

### 1. Execute the 1-Click Automated Walkthrough Demo
Run the complete end-to-end evaluation runner:
```bash
python demo_walkthrough.py
```
*Verifies base commit integrity, runs Harbor linter, executes the Baseline vs Oracle validation matrix, and evaluates the 10-mutant injection suite in under two minutes.*

### 2. Verify Harbor 0.25 Linter Compliance
```bash
harbor lint task_packages/click-feature-command-aliases
harbor lint task_packages/click-feature-json-help-export
harbor lint task_packages/click-feature-nested-envvar-prefix
harbor lint task_packages/click-feature-parameter-deprecation
harbor lint task_packages/click-feature-password-minlen-validator
```
*(All 5 packages return exit code `0` with 0 errors and 0 warnings).*

### 3. Run Validation Matrix (Baseline 0.0 vs Oracle 1.0)
```bash
python validate_tasks.py
```

### 4. Run Mutation Testing Suite (100% Kill Rate)
```bash
python run_mutation_testing.py
```

---

## 💻 Full-Stack SaaS Application Quick Start

To launch the interactive Coding Task Factory web application:

### 1. Start the FastAPI Backend
```bash
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
- API Endpoint: `http://127.0.0.1:8000`
- Interactive Swagger Docs: `http://127.0.0.1:8000/docs`

### 2. Start the React Frontend
```bash
cd frontend
npm run dev -- --host 127.0.0.1 --port 5173
```
- Application URL: `http://localhost:5173`

### 3. Default Verified Test Credentials
- **Email**: `developer@codingtaskfactory.io`
- **Password**: `Developer@2026!` *(Or use the 1-click **"Demo Developer Login"** button on the sign-in page for instant verified access).*

---

## 📄 License
This project is open-sourced under the MIT License. The target foundation repository `pallets/click` is licensed under the BSD-3-Clause License.
