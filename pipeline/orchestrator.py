"""
Task Factory Pipeline Orchestrator
Main runner for synthesizing and packaging all 5 distinct feature tasks for pallets/click.
"""

import sys
from pathlib import Path
from typing import List
from .config import TASK_PACKAGES_DIR, DEFAULT_CONFIG
from .repo_analyzer import RepoAnalyzer
from .package_builder import PackageBuilder
from .feature_definitions import TASKS_DATA

def generate_all_tasks(output_dir: Path = TASK_PACKAGES_DIR) -> List[Path]:
    print("=" * 70)
    print("TaskForge: Automated Feature-Development Task Factory Pipeline")
    print(f"Target Repository: {DEFAULT_CONFIG.repo_name}")
    print(f"Base Commit: {DEFAULT_CONFIG.base_commit} (Release {DEFAULT_CONFIG.release_tag})")
    print("=" * 70)

    analyzer = RepoAnalyzer()
    analyzer.ensure_repo()
    print(f"[*] Verified base commit: {analyzer.get_commit_hash()}")

    builder = PackageBuilder(output_root=output_dir)
    generated_paths = []

    for idx, task_data in enumerate(TASKS_DATA, 1):
        task_id = task_data["id"]
        print(f"\n[{idx}/5] Synthesizing task package: {task_id}")
        print(f"      Title: {task_data['title']}")

        pkg_path = builder.build_package(
            task_id=task_id,
            title=task_data["title"],
            description=task_data["description"],
            instruction_md=task_data["instruction"],
            solution_patch=task_data["solution_patch"],
            test_feature_py=task_data["test_feature"],
            fail_to_pass=task_data["fail_to_pass"],
            pass_to_pass=task_data["pass_to_pass"],
            base_commit=DEFAULT_CONFIG.base_commit
        )
        generated_paths.append(pkg_path)
        print(f"      [OK] Packaged into: {pkg_path}")

    print("\n" + "=" * 70)
    print(f"Successfully generated {len(generated_paths)} distinct task packages in {output_dir}")
    print("=" * 70)
    return generated_paths

if __name__ == "__main__":
    generate_all_tasks()
