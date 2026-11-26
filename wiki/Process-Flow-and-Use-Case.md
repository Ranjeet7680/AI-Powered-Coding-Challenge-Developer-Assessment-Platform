<div align="center">
  <img src="../docs/assets/wiki-header.svg" alt="Coding Task Factory Pipeline Diagrams Banner" width="100%" />
</div>

# Pipeline Process Flow, Use-Case & Architecture Diagrams

[← Back to Wiki Home](Home.md)

---

## 1. End-to-End Pipeline Process Flow Diagram

The Coding Task Factory (`TaskForge` + Sandbox) pipeline accepts **repository specifications** (Git URL, pinned commit SHA, language, test runner) or **container image parameters** (base image, C++/Python dependencies such as `open-source-parsers/jsoncpp`, runtime limits), synthesizes self-contained **task packages with reference tests**, executes **target AI models**, and emits **validated benchmark results & artifacts**.

```mermaid
flowchart TD
  Start([Input Request]) --> InputChoice{Input Specification Type}

  InputChoice -->|Repository Specs| RepoSpec["Repo Specification<br/>Git URL · Commit SHA · Language · Test Runner"]
  InputChoice -->|Image Parameters| ImgSpec["Image Parameters<br/>Base Image · Tooling (Python / Node / g++ + JsonCpp) · Resource Caps"]

  RepoSpec --> EnvPrep["RepoAnalyzer & Environment Builder<br/>Clone/Checkout Base Commit · Inspect AST & Subsystems"]
  ImgSpec --> EnvPrep

  EnvPrep -->PkgGen["PackageBuilder (Harbor 0.25 Generator)<br/>Synthesize instruction.md · task.toml · Environment Dockerfile"]
  PkgGen --> RefTests["Attach Reference Tests & Oracle Patch<br/>tests/test_feature.py (F2P + P2P) · solution/solution.patch"]

  RefTests --> SchemaGate{Harbor 0.25 Schema &<br/>Zero-Leakage Check}
  SchemaGate -->|Fix Required| PkgGen
  SchemaGate -->|Passed| ExecMatrix["Execution Harness (Sandboxed Runner)"]

  ExecMatrix --> BaselineRun["Baseline Trial (nop)<br/>Verify clean repo fails feature tests (Reward = 0.0)"]
  ExecMatrix --> ModelRun["Target AI Model Execution<br/>Run target LLMs / agents inside isolated sandbox"]
  ExecMatrix --> OracleRun["Oracle & Mutation Run<br/>Verify reference patch (1.0) + 100% mutant kill"]

  BaselineRun & ModelRun & OracleRun --> Grader["Validator Engine (pipeline/validator.py)<br/>Run Reference Test Suite & Collect Metrics"]
  Grader --> Output["Output Validated Results<br/>Scorecard JSON · Pass/Fail Vectors · Audit Logs · Certificates"]
```

---

## 2. System Use-Case Diagram

Shows actors interacting with core capabilities across task ingestion, AI model benchmarking, multi-language sandbox execution (Python, JS, TS, C++20 with `jsoncpp`), and validated result reporting.

```mermaid
flowchart LR
  Author((Task Author /<br/>Maintainer))
  TargetAI((Target AI<br/>Coding Model))
  Verifier((Validator &<br/>CI Harness))
  Learner((Developer /<br/>Candidate))

  subgraph System["Coding Task Factory & TaskForge System Boundary"]
    UC1(["UC-1: Supply Repository Specs<br/>or Docker Image Params"])
    UC2(["UC-2: Generate Task Package &<br/>Reference Test Suite"])
    UC3(["UC-3: Run Target AI Model<br/>Against Task Prompt"])
    UC4(["UC-4: Execute Code & Reference Tests<br/>(Python / JS / TS / C++ JsonCpp)"])
    UC5(["UC-5: Validate Baseline (nop),<br/>Oracle & Mutation Kills"])
    UC6(["UC-6: Output Validated Results,<br/>Evidence & PDF Credentials"])
  end

  Author --> UC1
  Author --> UC2
  UC2 -. "<<include>>" .-> UC4

  TargetAI --> UC3
  UC3 -. "<<include>>" .-> UC4

  Verifier --> UC5
  UC5 -. "<<include>>" .-> UC4
  UC5 --> UC6

  Learner --> UC4
  Learner --> UC6
```

---

## 3. High-Level Pipeline Architecture Diagram

```mermaid
flowchart TB
  subgraph Inputs["1. Input Specifications"]
    R["Repository Spec<br/>(pipeline/config.py · Git URL · SHA)"]
    I["Image Parameters<br/>(Dockerfile · Base Runtime · C++ JsonCpp)"]
  end

  subgraph Generator["2. Task Package Synthesis (pipeline/)"]
    O["orchestrator.py & repo_analyzer.py"]
    P["package_builder.py & feature_definitions.py"]
    F["Generated Task Packages (task_packages/)<br/>instruction.md + tests/ + solution.patch + Dockerfile"]
    O --> P --> F
  end

  subgraph Execution["3. Target AI Model & Sandbox Runtime"]
    AI["Target AI Model Runner<br/>(Gemini / Frontier Agent Evaluation)"]
    SB["Isolated Subprocess & Container Sandbox<br/>(code_runner.py: Python, Node, C++20 + vendor/jsoncpp)"]
    AI --> SB
  end

  subgraph Validation["4. Validation & Output Artifacts"]
    V["validator.py & mutation_tester.py<br/>Baseline 0.0 · Oracle 1.0 · Mutation Kill 100%"]
    OUT["Validated Results Store<br/>validation_evidence/ JSON · Audit Reports · PDF Certs"]
    V --> OUT
  end

  R & I --> Generator
  F --> Execution
  F --> Validation
  SB --> V
```
