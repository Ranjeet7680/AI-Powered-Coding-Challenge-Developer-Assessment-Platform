# TaskForge: Technical Explanation & System Architecture

## 1. Executive Summary

**TaskForge** is an automated task factory pipeline built for **Track 1** of the Innodata AI Hackathon. Rather than hand-crafting benchmark tasks, TaskForge autonomously synthesizes realistic, high-signal, SWE-bench-style feature-development task packages strictly compliant with the **Harbor 0.25 framework**.

Every synthesized task satisfies the core hackathon constraints:
- **Zero Bug Fixes**: Tasks represent purely new feature development or behavioral evolutions.
- **Clean Foundation**: Tasks build on an unmodified upstream open-source repository commit (`pallets/click` @ `934813e4d421071a1b3db3973c02fe2721359a6e`, Click v8.1.8 release tag), where 100% of existing tests pass.
- **Harbor 0.25 Standard**: Each package contains `instruction.md`, unified `solution/solution.patch`, `environment/Dockerfile`, isolated `tests/Dockerfile`, `task.toml` (schema v1.4), and SWE-bench-style `fail_to_pass.json` and `pass_to_pass.json` descriptors.
- **Strict Automated Grading Compliance**:
  - **Baseline (`nop`) Check**: Untouched repo yields Reward = `0.0` (new feature tests fail, all existing regression tests pass).
  - **Oracle (`oracle`) Check**: Reference solution yields Reward = `1.0` (all feature and regression tests pass).
- **Substantive Variation**: 5 distinct tasks touch separate Click architectural subsystems (parameter validation, command routing, help generation, context resolution, and deprecation lifecycle).
- **Test Suite Rigor**: Mutation testing proves 100% kill rate (10/10 injected mutants caught and eliminated).

---

## 2. Target Repository & Starting Commit Selection

### Chosen Repository: `pallets/click`
- **Language**: Python (3.11 / 3.12 compatible)
- **Domain**: Production-grade composable command-line interface toolkit used by millions of developers worldwide.
- **Test Runner**: `pytest`
- **Upstream License**: BSD-3-Clause

### Base Commit Selection
- **Commit Hash**: `934813e4d421071a1b3db3973c02fe2721359a6e`
- **Release Tag**: `8.1.8`
- **Rationale**:
  1. **Stability**: `8.1.8` is a tagged production release ensuring full environment reproducibility.
  2. **100% Upstream Pass**: All existing regression tests pass cleanly without environment-specific flakes.
  3. **Non-Existence Upstream**: The 5 features synthesized by TaskForge do not exist upstream in `8.1.8` or subsequent releases, guaranteeing zero data leakage.

---

## 3. Task Package Specification & Harbor Framework Adherence

Each task generated in `task_packages/` adheres strictly to Harbor 0.25 directory conventions and passes `harbor lint` with **0 errors and 0 warnings**:

```
task_packages/<task-name>/
├── instruction.md          # Clear, unambiguous functional requirements document
├── task.toml               # Harbor metadata (schema_version = "1.4", base_commit, license)
├── solution/
│   ├── solution.patch      # Clean unified git diff applying in-tree
│   └── solve.sh            # Shell script applying the patch
├── tests/
│   ├── test_feature.py     # Comprehensive pytest suite testing the new feature
│   ├── test.sh             # Harbor test execution runner with ctrf reporting
│   ├── Dockerfile          # Isolated test execution container
│   ├── fail_to_pass.json   # Feature test identifiers (SWE-bench format)
│   └── pass_to_pass.json   # Existing regression test identifiers (SWE-bench format)
└── environment/
    └── Dockerfile          # Reproducible repository build container starting at base_commit
```

### Harbor Linter Quality Guarantees
- `authors = []` in `task.toml` to comply with Harbor model author validation.
- Pinned Python dependencies (`pytest==8.2.2`, `pytest-json-ctrf==0.5.2`) in Dockerfiles to satisfy the `unpinned-python-dependency` rule.
- Unified patches verified with `git apply --check` for clean whitespace and zero hunk corruption.

---

## 4. Substantive Task Variation Strategy

To prevent superficial variations (such as simple parameter renames or docstring edits), TaskForge employs an architectural subslicing strategy. The 5 generated tasks exercise 5 distinct architectural subsystems within the Click codebase:

| Task ID | Subsystem Touched | Architectural Evolution | Real-World Developer Value |
| :--- | :--- | :--- | :--- |
| **`click-feature-password-minlen-validator`** | Parameter Validation & Terminal UI (`core.py`, `decorators.py`, `termui.py`) | Adds `min_length` boundary constraints and custom `validator` callbacks to `@click.password_option()` and `click.prompt(hide_input=True)`. | Prevents insecure or malformed credentials at CLI intake without custom wrapper boilerplate. |
| **`click-feature-command-aliases`** | Command Parsing & Dispatch (`core.py`) | Implements first-class `aliases` for subcommands registered under `@click.group()` / `Group.add_command`, with conflict detection and automated help display. | Enhances UX for complex CLIs by supporting standard shortcuts (e.g., `git co` for `checkout`). |
| **`click-feature-json-help-export`** | Introspection & Formatting (`core.py`) | Adds structured machine-readable JSON export mode (`help_format="json"`) to `Command.get_help()`, emitting structured option schemas and subcommand listings. | Enables automated doc-generation, shell-completion bots, and agentic tool discovery. |
| **`click-feature-nested-envvar-prefix`** | Context & Environment Resolution (`core.py`) | Enables hierarchical auto-prefix propagation across multi-level command groups with configurable delimiters (`nested_auto_envvar=True`, `nested_envvar_delimiter="__"`). | Enables 12-factor cloud-native configuration across deeply nested microservice CLIs. |
| **`click-feature-parameter-deprecation`** | Parameter Lifecycle Management (`core.py`, `exceptions.py`, `__init__.py`) | Introduces formal parameter deprecation lifecycle with `ClickDeprecationWarning` runtime emission and `[Deprecated: ...]` help annotations. | Provides smooth backward-compatible migrations when refactoring CLI interfaces. |

---

## 5. Automated Validation Matrix & Grading Evidence

Harbor evaluates each task package inside isolated environments by executing two standard passes:

1. **Baseline Check (`nop`)**:
   - Repository left untouched at base commit `934813e4d421071a1b3db3973c02fe2721359a6e`.
   - Expected reward: **`0.0`** (feature tests fail because feature is absent; all existing regression tests pass).
2. **Oracle Check (`oracle`)**:
   - Reference implementation patch applied cleanly.
   - Expected reward: **`1.0`** (feature tests pass completely; all existing regression tests remain green).

### Validation Results Summary

| Task Package | Baseline Reward | Oracle Reward | Regressions Passed | Validation Status |
| :--- | :---: | :---: | :---: | :---: |
| `click-feature-command-aliases` | `0.0` | `1.0` | Yes | **PASS (100%)** |
| `click-feature-json-help-export` | `0.0` | `1.0` | Yes | **PASS (100%)** |
| `click-feature-nested-envvar-prefix` | `0.0` | `1.0` | Yes | **PASS (100%)** |
| `click-feature-parameter-deprecation` | `0.0` | `1.0` | Yes | **PASS (100%)** |
| `click-feature-password-minlen-validator` | `0.0` | `1.0` | Yes | **PASS (100%)** |

---

## 6. Mutation Testing & Test Suite Rigor Analysis

To prove that the generated tests are rigorous and sensitive to functional defects rather than generating trivial passes, TaskForge incorporates an automated **Mutation Testing Suite** (`run_mutation_testing.py`).

10 deliberate bugs and edge-case boundary errors were injected across the solution patches:

| Mutant ID | Task ID | Injected Defect Description | Test Suite Behavior | Outcome |
| :--- | :--- | :--- | :--- | :---: |
| **`MUT-1.1`** | `password-minlen-validator` | Bypassed minimum length check | Feature test failed on boundary assertion | **KILLED** |
| **`MUT-1.2`** | `password-minlen-validator` | Disabled custom validator callback | Feature test failed on invalid password prompt | **KILLED** |
| **`MUT-2.1`** | `command-aliases` | Disabled alias dispatch lookup in `get_command` | Alias invocation failed with exit code 2 | **KILLED** |
| **`MUT-2.2`** | `command-aliases` | Omitted alias strings from help formatting | Help check failed missing alias annotation | **KILLED** |
| **`MUT-3.1`** | `json-help-export` | Ignored `help_format="json"` parameter | Help text parser failed JSON decoding | **KILLED** |
| **`MUT-3.2`** | `json-help-export` | Omitted subcommands list from JSON payload | Assertion on `deploy` subcommand failed | **KILLED** |
| **`MUT-4.1`** | `nested-envvar-prefix` | Hardcoded single `_` ignoring custom `__` delimiter | Environment lookup for `ACME__SERVE_PORT` failed | **KILLED** |
| **`MUT-4.2`** | `nested-envvar-prefix` | Disabled prefix inheritance on child context | Nested subcommand failed to resolve envvar | **KILLED** |
| **`MUT-5.1`** | `parameter-deprecation` | Suppressed `ClickDeprecationWarning` runtime emission | `pytest.deprecated_call` caught missing warning | **KILLED** |
| **`MUT-5.2`** | `parameter-deprecation` | Omitted `[Deprecated]` tag from help output | Help string assertion failed | **KILLED** |

**Mutation Score: 10/10 Killed (100.0% Kill Rate)**.

---

## 7. Pipeline Execution Architecture

```
                       +-----------------------------------+
                       | pallets/click @ 934813e (v8.1.8) |
                       +-----------------+-----------------+
                                         |
                                         v
                       +-----------------------------------+
                       |      TaskForge Pipeline Engine     |
                       |  - Subsystem Specification Engine |
                       |  - Instruction Document Builder   |
                       |  - Test Generator (fail/pass json)|
                       |  - Patch Synthesis & Verification |
                       +-----------------+-----------------+
                                         |
                                         v
                       +-----------------------------------+
                       | Harbor 0.25 Task Packages (1 to 5)|
                       |  - task.toml (schema v1.4)        |
                       |  - Dockerfiles (pinned deps)      |
                       |  - solution.patch & solve.sh      |
                       +-----------------+-----------------+
                                         |
             +---------------------------+---------------------------+
             |                                                       |
             v                                                       v
+--------------------------+                               +--------------------------+
|  Harbor 0.25 Linter Check |                               |   Harbor Validation Matrix |
|   0 Errors / 0 Warnings  |                               |   Baseline (nop)  : 0.0  |
+--------------------------+                               |   Oracle (oracle) : 1.0  |
                                                           +------------+-------------+
                                                                        |
                                                                        v
                                                           +--------------------------+
                                                           |  Mutation Testing Engine |
                                                           |   100% Mutation Kill     |
                                                           |   (10/10 Mutants Killed) |
                                                           +--------------------------+
```

---

## 8. Summary of Deliverable Assets

- **Task Packages**: Located in `task_packages/` (all 5 complete and lint-clean).
- **Validation Evidence**: Located in `validation_evidence/`:
  - `validation_report.json` & `validation_summary.md`
  - `mutation_report.json` & `mutation_summary.md`
  - Raw baseline, oracle, and mutation logs in `validation_evidence/*_logs/`.
- **Reproducibility**: Run `python validate_tasks.py` and `python run_mutation_testing.py`.
