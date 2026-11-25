"""
Harbor Task Package Builder
Constructs strict Harbor 0.25 compliant task packages with all required components.
"""

import json
from pathlib import Path
from typing import List, Dict, Any
from .config import TASK_PACKAGES_DIR, DEFAULT_CONFIG

class PackageBuilder:
    def __init__(self, output_root: Path = TASK_PACKAGES_DIR):
        self.output_root = output_root

    def build_package(
        self,
        task_id: str,
        title: str,
        description: str,
        instruction_md: str,
        solution_patch: str,
        test_feature_py: str,
        fail_to_pass: List[str],
        pass_to_pass: List[str],
        base_commit: str = DEFAULT_CONFIG.base_commit
    ) -> Path:
        """Create a complete Harbor 0.25 task directory."""
        task_dir = self.output_root / task_id
        env_dir = task_dir / "environment"
        sol_dir = task_dir / "solution"
        test_dir = task_dir / "tests"

        for d in [env_dir, sol_dir, test_dir]:
            d.mkdir(parents=True, exist_ok=True)

        # 1. instruction.md
        (task_dir / "instruction.md").write_text(instruction_md.strip() + "\n", encoding="utf-8")

        # 2. task.toml (Harbor 0.25 specification)
        task_toml_content = f"""schema_version = "1.4"
artifacts = []

[task]
name = "innodata/{task_id}"
version = "1.0.0"
description = "{description}"
authors = []
keywords = ["click", "cli", "python", "feature-development", "harbor"]

[metadata]
repository = "https://github.com/pallets/click"
base_commit = "{base_commit}"
release_tag = "8.1.8"
license = "BSD-3-Clause"
language = "python"
track = "track-1"

[verifier]
timeout_sec = 600.0
environment_mode = "separate"
collect = []

[agent]
timeout_sec = 600.0

[environment]
network_mode = "public"
build_timeout_sec = 600.0
os = "linux"
mcp_servers = []
"""
        (task_dir / "task.toml").write_text(task_toml_content, encoding="utf-8")

        # 3. environment/Dockerfile
        # Builds clean pallets/click at the base_commit in Ubuntu 24.04 with Python 3.12
        env_dockerfile = f"""FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y \\
    git \\
    python3 \\
    python3-pip \\
    python3-venv \\
    ca-certificates \\
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
RUN git clone https://github.com/pallets/click.git /app \\
    && git checkout {base_commit}

RUN python3 -m venv /venv
ENV PATH="/venv/bin:$PATH"
RUN pip install --no-cache-dir -e . && pip install --no-cache-dir pytest==8.2.2
"""
        (env_dir / "Dockerfile").write_text(env_dockerfile, encoding="utf-8")

        # 4. solution/
        (sol_dir / "solution.patch").write_text(solution_patch.strip() + "\n", encoding="utf-8")
        solve_sh = """#!/bin/bash
set -e

# Apply reference solution patch to /app
cd /app
if [ -f /solution/solution.patch ]; then
    git apply /solution/solution.patch
elif [ -f solution.patch ]; then
    git apply solution.patch
fi

# Re-install package to ensure in-tree bytecode or metadata is updated
pip install -e . --no-deps
"""
        (sol_dir / "solve.sh").write_text(solve_sh, encoding="utf-8")

        # 5. tests/
        (test_dir / "test_feature.py").write_text(test_feature_py.strip() + "\n", encoding="utf-8")
        (test_dir / "fail_to_pass.json").write_text(json.dumps(fail_to_pass, indent=2) + "\n", encoding="utf-8")
        (test_dir / "pass_to_pass.json").write_text(json.dumps(pass_to_pass, indent=2) + "\n", encoding="utf-8")

        # tests/Dockerfile (for separate verifier mode in Harbor)
        test_dockerfile = """FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y \\
    python3 \\
    python3-pip \\
    python3-venv \\
    && rm -rf /var/lib/apt/lists/*

RUN python3 -m venv /venv
ENV PATH="/venv/bin:$PATH"
RUN pip install --no-cache-dir pytest==8.2.2 pytest-json-ctrf==0.5.2
"""
        (test_dir / "Dockerfile").write_text(test_dockerfile, encoding="utf-8")

        # tests/test.sh (Harbor validation runner)
        test_sh = """#!/bin/bash
set -e

mkdir -p /logs/verifier
REWARD_FILE="/logs/verifier/reward.txt"

# Copy new feature test into target repo test suite
cp /tests/test_feature.py /app/tests/

cd /app

# Step 1: Run existing regression tests (must all pass)
echo "=== Running Existing Regression Tests ==="
REGRESSION_FAILED=0
if [ -f /tests/pass_to_pass.json ]; then
    if ! python3 -c '
import json, subprocess, sys
tests = json.load(open("/tests/pass_to_pass.json", encoding="utf-8"))
if tests:
    res = subprocess.run(["pytest", *tests, "-q"])
    sys.exit(res.returncode)
'; then
        echo "Regression tests failed!"
        REGRESSION_FAILED=1
    fi
fi

if [ "$REGRESSION_FAILED" -eq 1 ]; then
    echo 0.0 > "$REWARD_FILE"
    exit 0
fi

# Step 2: Run new feature tests
echo "=== Running New Feature Tests ==="
if pytest tests/test_feature.py -rA; then
    echo "Feature tests passed!"
    echo 1.0 > "$REWARD_FILE"
else
    echo "Feature tests failed (expected on baseline/nop)."
    echo 0.0 > "$REWARD_FILE"
fi
"""
        (test_dir / "test.sh").write_text(test_sh, encoding="utf-8")

        return task_dir
