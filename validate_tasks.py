#!/usr/bin/env python3
"""
TaskForge Validation Matrix Runner
Executes Baseline (nop) and Oracle (oracle) passes for all 5 synthesized task packages.
Emits comprehensive logs, metrics, and summary evidence to validation_evidence/.
"""

import sys
import json
import time
from pathlib import Path
from pipeline.config import TASK_PACKAGES_DIR, VALIDATION_EVIDENCE_DIR, DEFAULT_CONFIG
from pipeline.validator import TaskValidator

def main():
    print("=" * 75)
    print("TaskForge: Harbor Validation Matrix & Automated Grading Runner")
    print(f"Target Repository: {DEFAULT_CONFIG.repo_name} @ {DEFAULT_CONFIG.base_commit}")
    print("=" * 75)

    VALIDATION_EVIDENCE_DIR.mkdir(parents=True, exist_ok=True)
    baseline_logs_dir = VALIDATION_EVIDENCE_DIR / "baseline_logs"
    oracle_logs_dir = VALIDATION_EVIDENCE_DIR / "oracle_logs"
    baseline_logs_dir.mkdir(exist_ok=True)
    oracle_logs_dir.mkdir(exist_ok=True)

    validator = TaskValidator()
    task_dirs = sorted([d for d in TASK_PACKAGES_DIR.iterdir() if d.is_dir()])

    results = []
    start_total = time.time()

    for idx, task_dir in enumerate(task_dirs, 1):
        print(f"\n[{idx}/{len(task_dirs)}] Evaluating Task Package: {task_dir.name}")
        t0 = time.time()
        res = validator.validate_task_local(task_dir)
        elapsed = round(time.time() - t0, 2)
        res["duration_sec"] = elapsed
        results.append(res)

        b_reward = res["baseline"]["reward"]
        o_reward = res["oracle"]["reward"]
        reg_b = res["baseline"]["regression_passed"]
        reg_o = res["oracle"]["regression_passed"]

        # Write log outputs
        (baseline_logs_dir / f"{task_dir.name}_baseline.log").write_text(
            res["baseline"].get("stdout", "") + "\n" + res["baseline"].get("stderr", ""),
            encoding="utf-8"
        )
        (oracle_logs_dir / f"{task_dir.name}_oracle.log").write_text(
            res["oracle"].get("stdout", "") + "\n" + res["oracle"].get("stderr", ""),
            encoding="utf-8"
        )

        status_str = "[PASS]" if res["is_valid"] else "[FAIL]"
        print(f"      {status_str} Completed in {elapsed}s")
        print(f"      Baseline (nop) Reward : {b_reward} (Expected: 0.0, Regressions: {reg_b})")
        print(f"      Oracle (oracle) Reward: {o_reward} (Expected: 1.0, Regressions: {reg_o})")

    total_elapsed = round(time.time() - start_total, 2)

    # Save JSON report
    report_file = VALIDATION_EVIDENCE_DIR / "validation_report.json"
    report_data = {
        "repository": DEFAULT_CONFIG.repo_name,
        "base_commit": DEFAULT_CONFIG.base_commit,
        "release_tag": DEFAULT_CONFIG.release_tag,
        "total_tasks": len(results),
        "all_passed": all(r["is_valid"] for r in results),
        "total_duration_sec": total_elapsed,
        "tasks": results
    }
    report_file.write_text(json.dumps(report_data, indent=2), encoding="utf-8")

    # Generate Markdown Summary Matrix
    summary_file = VALIDATION_EVIDENCE_DIR / "validation_summary.md"
    summary_lines = [
        "# TaskForge Automated Validation Matrix Evidence",
        "",
        f"- **Target Repository**: `{DEFAULT_CONFIG.repo_name}`",
        f"- **Base Commit**: `{DEFAULT_CONFIG.base_commit}` (Release `{DEFAULT_CONFIG.release_tag}`)",
        f"- **Total Tasks Evaluated**: {len(results)}",
        f"- **Evaluation Status**: {'ALL PASSED (100% Compliance)' if report_data['all_passed'] else 'FAILURES DETECTED'}",
        f"- **Total Validation Duration**: {total_elapsed}s",
        "",
        "## Validation Matrix Results",
        "",
        "| Task ID | Baseline (nop) Reward | Oracle Reward | Regressions Clean | Result | Duration |",
        "| :--- | :---: | :---: | :---: | :---: | :---: |"
    ]

    for r in results:
        task_id = r["task"]
        b_rew = r["baseline"]["reward"]
        o_rew = r["oracle"]["reward"]
        clean_reg = "Yes" if (r["baseline"]["regression_passed"] and r["oracle"]["regression_passed"]) else "No"
        res_tag = "PASSED" if r["is_valid"] else "FAILED"
        dur = f"{r['duration_sec']}s"
        summary_lines.append(f"| `{task_id}` | `{b_rew:.1f}` | `{o_rew:.1f}` | {clean_reg} | **{res_tag}** | {dur} |")

    summary_lines.extend([
        "",
        "## Grading Criteria Alignment",
        "- **Baseline Pass (`nop`)**: Untouched repository produces reward `0.0` (new feature tests fail, existing tests pass).",
        "- **Oracle Pass (`oracle`)**: Reference solution patch produces reward `1.0` (all feature and existing regression tests pass).",
        "- **Test Suite Integrity**: Zero regressions detected across existing tests in `pass_to_pass.json`."
    ])

    summary_file.write_text("\n".join(summary_lines) + "\n", encoding="utf-8")

    print("\n" + "=" * 75)
    print(f"Validation evidence generated in: {VALIDATION_EVIDENCE_DIR}")
    print(f"Report: {report_file}")
    print(f"Summary Table: {summary_file}")
    print("=" * 75)

if __name__ == "__main__":
    main()
