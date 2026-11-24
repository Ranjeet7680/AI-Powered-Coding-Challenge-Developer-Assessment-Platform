# TaskForge: Walkthrough Video & Live Demonstration Guide

This document provides the walkthrough script, storyboard, and step-by-step instructions for demonstrating the **TaskForge** automated task factory pipeline for Track 1 of the Innodata AI Hackathon.

---

## 1. Quick Demonstration Execution (One Command)

Judges and evaluators can run the end-to-end demonstration script directly from the repository root:

```bash
python demo_walkthrough.py
```

This automated runner executes the entire pipeline lifecycle and produces real-time validation evidence:
1. **Commit Integrity Check**: Verifies `pallets/click` @ commit `934813e4d421071a1b3db3973c02fe2721359a6e` (v8.1.8).
2. **Package Inspection**: Checks all 5 generated Harbor 0.25 task packages.
3. **Harbor Lint Verification**: Executes `harbor lint` to prove **0 errors, 0 warnings**.
4. **Validation Matrix Pass**: Runs Baseline (`nop` = 0.0) and Oracle (`oracle` = 1.0) checks for all 5 tasks.
5. **Mutation Testing Pass**: Executes the 10-mutant injection suite to prove a **100% mutation kill rate**.

---

## 2. Walkthrough Video Storyboard & Script

| Timestamp | Phase | Visual on Screen | Narration & Key Points |
| :---: | :--- | :--- | :--- |
| **0:00 - 0:45** | **Introduction & Problem Statement** | Title slide: "TaskForge — Track 1 Task Factory Pipeline". Architecture diagram showing factory intake from `pallets/click` to Harbor 0.25 packages. | *"Welcome to TaskForge. For Track 1 of the Innodata AI Hackathon, we engineered a fully automated task factory pipeline that reads an open-source repository and continuously generates realistic, high-signal feature-development benchmark tasks. Our system adheres strictly to the Harbor 0.25 framework and requires zero bug fixes or modified starting repositories."* |
| **0:45 - 1:30** | **Base Repository & Commit Selection** | Terminal showing `git checkout 934813e` and `pytest` running across existing Click test suite with 100% pass rate. | *"We selected pallets/click at commit 934813e, representing the stable v8.1.8 release. At this commit, all upstream tests pass cleanly. None of our 5 generated features exist in this release or subsequent upstream releases, guaranteeing zero data leakage and a completely clean foundation."* |
| **1:30 - 2:45** | **Task Synthesis & Substantive Variation** | Tree view of `task_packages/` showcasing the 5 distinct task folders, highlighting `instruction.md`, `solution/solution.patch`, and `tests/`. | *"To prevent trivial variations, TaskForge synthesizes 5 substantive features across 5 distinct architectural subsystems of Click: password length constraints and validators in termui, first-class command aliases in Group routing, machine-readable JSON help export, nested environment variable prefix propagation, and parameter deprecation lifecycle warnings. Each package strictly conforms to Harbor 0.25 directory and schema specifications."* |
| **2:45 - 3:30** | **Harbor Linter Verification** | Running `harbor lint task_packages/*` in terminal showing return code 0 and zero warnings. | *"Notice that running the official Harbor 0.25 CLI linter against all 5 task packages returns zero errors and zero warnings, verifying that author metadata, Dockerfiles, and task.toml files conform strictly to the Harbor standard."* |
| **3:30 - 4:45** | **Automated Validation Matrix (Baseline vs Oracle)** | Running `python validate_tasks.py`. Real-time terminal output showing Baseline 0.0 and Oracle 1.0 for each task. | *"Next, we execute the automated grading validation matrix. For each task, the Baseline nop pass leaves the code untouched, proving that feature tests fail and existing regressions pass, earning a reward of 0.0. The Oracle pass applies the reference patch, proving that all feature tests pass and all regressions remain green, achieving a perfect reward of 1.0."* |
| **4:45 - 5:45** | **Mutation Testing & Test Rigor** | Running `python run_mutation_testing.py`. Showing all 10 injected mutants caught and killed by the test suites. | *"To demonstrate that our test suites are rigorous and sensitive to functional defects rather than generating trivial passes, TaskForge executes an automated mutation testing suite. Across 10 deliberate fault injections—including boundary inversion, bypassed validators, and disabled deprecation notices—our test suites achieved a 100% kill rate."* |
| **5:45 - 6:00** | **Conclusion & Deliverables** | Screen showing `validation_evidence/` summary tables and repository documentation. | *"All task packages, validation evidence, raw execution logs, and reproducible runner scripts are packaged in the repository. Thank you."* |

---

## 3. Individual Component Execution Commands

For granular verification, individual subsystems can be run independently:

```bash
# 1. Regenerate all task packages
python run_factory.py

# 2. Lint task packages with Harbor CLI
harbor lint task_packages/click-feature-password-minlen-validator
harbor lint task_packages/click-feature-command-aliases
harbor lint task_packages/click-feature-json-help-export
harbor lint task_packages/click-feature-nested-envvar-prefix
harbor lint task_packages/click-feature-parameter-deprecation

# 3. Execute Baseline & Oracle validation passes
python validate_tasks.py

# 4. Execute Mutation Testing Suite
python run_mutation_testing.py
```
