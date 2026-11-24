"""
Mutation Tester
Executes mutation testing against task packages to prove test suite rigor:
Injects deliberate bugs into the solution implementation and verifies the test suite fails (mutant killed).
"""

import subprocess
import tempfile
from pathlib import Path
from typing import Dict, Any, List
from .config import DEFAULT_CONFIG

class MutationTester:
    def __init__(self, click_repo_path: Path = DEFAULT_CONFIG.local_path):
        self.click_repo_path = click_repo_path

    def run_mutation_test(
        self,
        task_dir: Path,
        mutant_patch: str,
        mutant_description: str
    ) -> Dict[str, Any]:
        """
        Applies a mutant patch and checks that tests fail (mutant killed).
        """
        test_content = (task_dir / "tests" / "test_feature.py").read_text(encoding="utf-8")

        with tempfile.TemporaryDirectory() as tmp_dir:
            work_dir = Path(tmp_dir) / "click_mutant"
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

            # Apply mutant patch
            patch_file = work_dir / "mutant.patch"
            patch_file.write_text(mutant_patch, encoding="utf-8")
            subprocess.run(
                ["git", "apply", "--whitespace=nowarn", str(patch_file)],
                cwd=str(work_dir),
                check=True,
                capture_output=True,
                text=True
            )

            # Run feature tests on mutant
            env = os.environ.copy()
            env["PYTHONPATH"] = str(work_dir / "src")
            feat_cmd = subprocess.run(
                ["uv", "run", "pytest", "tests/test_feature.py", "-q"],
                cwd=str(work_dir),
                env=env,
                capture_output=True,
                text=True
            )

            # If tests FAIL on mutant -> Mutant is KILLED (Desirable!)
            mutant_killed = (feat_cmd.returncode != 0)

            return {
                "task": task_dir.name,
                "mutant_description": mutant_description,
                "mutant_killed": mutant_killed,
                "status": "PASS (Mutant Caught)" if mutant_killed else "FAIL (Mutant Escaped)",
                "test_output": feat_cmd.stdout[-500:] if feat_cmd.stdout else feat_cmd.stderr[-500:]
            }
