"""
Pipeline Configuration for Task Factory
Track 1 Target: pallets/click
Base Commit: 934813e4d421071a1b3db3973c02fe2721359a6e (Release 8.1.8)
"""

import os
from pathlib import Path
from dataclasses import dataclass, field
from typing import List, Dict, Any

PROJECT_ROOT = Path(__file__).parent.parent.resolve()
REPOS_DIR = PROJECT_ROOT / "repos"
TASK_PACKAGES_DIR = PROJECT_ROOT / "task_packages"
VALIDATION_EVIDENCE_DIR = PROJECT_ROOT / "validation_evidence"

@dataclass
class RepoTargetConfig:
    repo_name: str = "pallets/click"
    repo_url: str = "https://github.com/pallets/click.git"
    local_path: Path = REPOS_DIR / "click"
    language: str = "Python"
    test_runner: str = "pytest"
    base_commit: str = "934813e4d421071a1b3db3973c02fe2721359a6e"
    release_tag: str = "8.1.8"
    license: str = "BSD-3-Clause"
    install_commands: List[str] = field(default_factory=lambda: ["pip install -e .", "pip install pytest"])
    test_command: str = "pytest"

DEFAULT_CONFIG = RepoTargetConfig()
