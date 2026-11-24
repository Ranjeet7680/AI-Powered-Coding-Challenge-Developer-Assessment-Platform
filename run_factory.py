#!/usr/bin/env python3
"""
TaskForge: Automated Task Factory Pipeline Runner
Generates 5 distinct feature-development task packages for pallets/click according to Harbor 0.25 specifications.
"""

import sys
from pipeline.orchestrator import generate_all_tasks

def main():
    try:
        generate_all_tasks()
    except Exception as e:
        print(f"Error during task factory execution: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
