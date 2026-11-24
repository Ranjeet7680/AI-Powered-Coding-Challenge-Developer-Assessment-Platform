"""
Validation Matrix Runner
Validates tasks according to Harbor standards:
- Baseline (nop) check: repository untouched -> reward = 0.0
- Oracle (oracle) check: reference patch applied -> reward = 1.0
Also supports executing directly via Docker or local virtual environment.
"""

import os
import shutil
import tempfile
import subprocess
from pathlib import Path
from typing import Dict, Any, Tuple
from .config import DEFAULT_CONFIG

class TaskValidator:
    def __init__(self, click_repo_path: Path = DEFAULT_CONFIG.local_path):
        self.click_repo_path = click_repo_path

    def validate_task_local(self, task_dir: Path) -> Dict[str, Any]:
        """
        Execute baseline (nop) and oracle (oracle) passes in clean cloned workspaces
        mirroring the Harbor evaluation matrix.
        """
        sol_patch_path = task_dir / "solution" / "solution.patch"
        test_py_path = task_dir / "tests" / "test_feature.py"

        if not sol_patch_path.exists() or not test_py_path.exists():
            return {
                "task": task_dir.name,
                "status": "error",
                "message": "Missing solution.patch or test_feature.py"
            }

        # --- Pass 1: Baseline (nop) Check ---
        baseline_res = self._run_pass(task_dir, apply_patch=False)

        # --- Pass 2: Oracle Check ---
        oracle_res = self._run_pass(task_dir, apply_patch=True)

        is_valid = (
            baseline_res["reward"] == 0.0 and
            oracle_res["reward"] == 1.0 and
            baseline_res["regression_passed"] and
            oracle_res["regression_passed"]
        )

        return {
            "task": task_dir.name,
            "status": "passed" if is_valid else "failed",
            "is_valid": is_valid,
            "baseline": baseline_res,
            "oracle": oracle_res
        }

    def _run_pass(self, task_dir: Path, apply_patch: bool) -> Dict[str, Any]:
        """Execute test run in an isolated workspace copy."""
        sol_patch = (task_dir / "solution" / "solution.patch").read_text(encoding="utf-8")
        test_content = (task_dir / "tests" / "test_feature.py").read_text(encoding="utf-8")

        with tempfile.TemporaryDirectory() as tmp_dir:
            work_dir = Path(tmp_dir) / "click_work"
            # Fast git clone from local repo
            subprocess.run(
                ["git", "clone", "--shared", str(self.click_repo_path), str(work_dir)],
                check=True,
                capture_output=True,
                text=True
            )
            subprocess.run(
                ["git", "checkout", DEFAULT_CONFIG.base_commit],
                cwd=str(work_dir),
                check=True,
                capture_output=True,
                text=True
            )

            # Copy feature test
            test_target = work_dir / "tests" / "test_feature.py"
            test_target.write_text(test_content, encoding="utf-8")

            if apply_patch:
                patch_file = work_dir / "solution.patch"
                patch_file.write_text(sol_patch, encoding="utf-8")
                patch_cmd = subprocess.run(
                    ["git", "apply", "--whitespace=nowarn", str(patch_file)],
                    cwd=str(work_dir),
                    capture_output=True,
                    text=True
                )
                if patch_cmd.returncode != 0:
                    return {
                        "reward": 0.0,
                        "error": f"Patch application failed: {patch_cmd.stderr}",
                        "feature_passed": False,
                        "regression_passed": False
                    }

            # Setup environment with in-tree src/
            env = os.environ.copy()
            env["PYTHONPATH"] = str(work_dir / "src")

            # Run regressions (sample of fast, high-coverage existing tests)
            reg_cmd = subprocess.run(
                ["uv", "run", "pytest", "tests/test_basic.py", "tests/test_commands.py", "tests/test_options.py", "-q"],
                cwd=str(work_dir),
                env=env,
                capture_output=True,
                text=True
            )
            regression_passed = (reg_cmd.returncode == 0)

            # Run feature tests
            feat_cmd = subprocess.run(
                ["uv", "run", "pytest", "tests/test_feature.py", "-v"],
                cwd=str(work_dir),
                env=env,
                capture_output=True,
                text=True
            )
            feature_passed = (feat_cmd.returncode == 0)

            reward = 0.0
            if regression_passed and feature_passed:
                reward = 1.0

            return {
                "reward": reward,
                "regression_passed": regression_passed,
                "feature_passed": feature_passed,
                "stdout": feat_cmd.stdout[-1500:] if feat_cmd.stdout else "",
                "stderr": feat_cmd.stderr[-500:] if feat_cmd.stderr else ""
            }
