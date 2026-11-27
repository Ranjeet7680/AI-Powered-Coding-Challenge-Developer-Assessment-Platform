<div align="center">
  <img src="../docs/assets/wiki-header.svg" alt="Track 1 TaskForge Harbor Pipeline Wiki" width="100%" />
</div>

# Track 1: TaskForge Automated Harbor 0.25 Pipeline

[← Back to Wiki Home](Home.md)

---

## Pipeline Architecture (`TaskForge`)

Built inside [`pipeline/`](../pipeline/) to generate clean, zero-leakage SWE-bench feature tasks targeting **`pallets/click` v8.1.8** at base commit `934813e4d421071a1b3db3973c02fe2721359a6e`.

```mermaid
flowchart LR
  Spec["Repo Specs / Image Params<br/>(pallets/click @ 934813e or Docker Env)"] --> Analyzer["repo_analyzer.py & feature_definitions.py"]
  Analyzer --> Builder["package_builder.py (Harbor 0.25 Synthesizer)"]
  Builder --> Pkg["task_packages/ (instruction.md, tests/, solution.patch, Dockerfile)"]
  Pkg --> AI["Target AI Model Runner & Container Sandbox"]
  Pkg --> Linter["Harbor 0.25 Linter: 0 Errors, 0 Warnings"]
  Pkg & AI --> Val["validator.py & mutation_tester.py"]
  Val --> Base["Baseline (nop) -> 0.0 Reward"]
  Val --> Oracle["Oracle (oracle) -> 1.0 Reward + 100% Mutant Kill"]
  Base & Oracle --> Out["Validated Results (validation_evidence/)"]
```

---

## Synthesized Feature Packages & Verification Scorecard

All evidence artifacts live in [`validation_evidence/`](../validation_evidence/):

| Package ID | Subsystem Modified | Baseline (`nop`) | Oracle (`oracle`) | Mutation Kill Rate | Harbor Lint |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **`click-feature-command-aliases`** | Command dispatch (`core.py`) | `0.0` | `1.0` | 100% (2/2) | 0 errors |
| **`click-feature-json-help-export`** | Help formatting (`core.py`) | `0.0` | `1.0` | 100% (2/2) | 0 errors |
| **`click-feature-nested-envvar-prefix`** | Context resolution (`core.py`) | `0.0` | `1.0` | 100% (2/2) | 0 errors |
| **`click-feature-parameter-deprecation`** | Lifecycle warnings (`core.py`, `exceptions.py`) | `0.0` | `1.0` | 100% (2/2) | 0 errors |
| **`click-feature-password-minlen-validator`** | Input validation (`termui.py`, `core.py`) | `0.0` | `1.0` | 100% (2/2) | 0 errors |

---

## Harbor 0.25 Mutation Testing & Zero-Leakage Validation Matrix

Details the automated integrity gates executed by [`validate_tasks.py`](../validate_tasks.py) and [`run_mutation_testing.py`](../run_mutation_testing.py) to ensure zero pre-patch solution leakage, deterministic oracle passes, and 100% mutant kill rates.

```mermaid
flowchart TD
  Start["Generated Task Package<br/>(task_packages/<id>/)"] --> Schema["Gate 1: Harbor 0.25 Schema &amp; Prompt Audit<br/>task.toml · instruction.md (0 spoilers) · Dockerfile"]

  Schema --> Base["Gate 2: Baseline Trial (nop)<br/>Clean pallets/click @ 934813e"]
  Schema --> Oracle["Gate 3: Oracle Trial (solve.sh)<br/>Apply Reference Solution Patch"]

  Base -->|"F2P MUST FAIL = 0.0<br/>Upstream P2P = 0 Regressions"| BaseOK["Baseline Verified"]
  Oracle -->|"F2P MUST PASS = 1.0<br/>Upstream P2P = 0 Regressions"| OracleOK["Oracle Verified"]

  BaseOK & OracleOK --> Mutants["Gate 4: Mutation Sweep (run_mutation_testing.py)<br/>Inject MUT-1.1 .. MUT-5.2 Faults"]
  Mutants --> KillCheck{"Every Mutant Caught by<br/>tests/test_outputs.py?"}
  KillCheck -->|"10/10 Killed (100%)"| Evidence["Emit validation_evidence/<br/>validation_report.json · logs · summary.md"]
  KillCheck -->|"Surviving Mutant"| Strengthen["Tighten Reference Tests &amp; Re-run"] --> Mutants
```

For full architectural rationale and Harbor schema guarantees, see [`docs/TECHNICAL_EXPLANATION.md`](../docs/TECHNICAL_EXPLANATION.md) and [`docs/WALKTHROUGH_DEMO.md`](../docs/WALKTHROUGH_DEMO.md).
