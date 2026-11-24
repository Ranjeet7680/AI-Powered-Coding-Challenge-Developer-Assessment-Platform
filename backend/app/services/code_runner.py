import subprocess
import time
import tempfile
import os
import sys
import json
from typing import List, Dict, Any, Optional

def run_python_code(code: str, test_cases: List[Dict[str, Any]], time_limit_sec: float = 3.0) -> Dict[str, Any]:
    """
    Executes Python code against each test case.
    Supports either standard IO (input()/print()) or wrapped test harnesses.
    """
    results = []
    passed_count = 0
    total_runtime_ms = 0
    overall_status = "Accepted"
    last_stdout = ""
    last_stderr = ""

    # If no test cases are passed, run once with blank input or custom input
    cases_to_run = test_cases if test_cases else [{"input": "", "expected_output": "", "is_hidden": False}]

    for idx, tc in enumerate(cases_to_run):
        input_data = str(tc.get("input", "")).replace("\\n", "\n")
        expected = str(tc.get("expected_output", "")).replace("\\n", "\n").strip()
        is_hidden = bool(tc.get("is_hidden", False))

        with tempfile.NamedTemporaryFile("w", suffix=".py", delete=False, encoding="utf-8") as f:
            f.write(code)
            temp_path = f.name

        start_time = time.perf_counter()
        passed = False
        actual_output = ""
        error_msg = None
        case_runtime_ms = 0

        try:
            process = subprocess.Popen(
                [sys.executable, temp_path],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            stdout, stderr = process.communicate(input=input_data, timeout=time_limit_sec)
            elapsed = time.perf_counter() - start_time
            case_runtime_ms = max(1, int(elapsed * 1000))
            total_runtime_ms += case_runtime_ms

            last_stdout = stdout
            last_stderr = stderr

            if process.returncode != 0:
                overall_status = "Runtime Error"
                error_msg = stderr.strip() if stderr else f"Process exited with code {process.returncode}"
                actual_output = stdout.strip()
            else:
                actual_output = stdout.strip()
                if not expected or actual_output == expected:
                    passed = True
                    passed_count += 1
                else:
                    passed = False
                    if overall_status == "Accepted":
                        overall_status = "Wrong Answer"
        except subprocess.TimeoutExpired:
            process.kill()
            overall_status = "Time Limit Exceeded"
            error_msg = f"Time Limit Exceeded (> {time_limit_sec}s)"
            case_runtime_ms = int(time_limit_sec * 1000)
            total_runtime_ms += case_runtime_ms
        except Exception as e:
            overall_status = "Runtime Error"
            error_msg = str(e)
        finally:
            try:
                os.remove(temp_path)
            except OSError:
                pass

        results.append({
            "test_case_index": idx + 1,
            "input": input_data if not is_hidden else "[Hidden Test Case]",
            "expected_output": expected if not is_hidden else "[Hidden Test Case]",
            "actual_output": actual_output if not is_hidden else ("[Hidden]" if not passed else "[Passed Hidden]"),
            "passed": passed,
            "runtime_ms": case_runtime_ms,
            "is_hidden": is_hidden,
            "error": error_msg
        })

    avg_runtime = int(total_runtime_ms / len(cases_to_run)) if cases_to_run else 12

    return {
        "status": overall_status if passed_count == len(cases_to_run) else ("Wrong Answer" if overall_status == "Accepted" else overall_status),
        "stdout": last_stdout,
        "stderr": last_stderr,
        "runtime_ms": avg_runtime,
        "memory_mb": round(14.5 + (avg_runtime * 0.02), 1),
        "passed_count": passed_count,
        "total_count": len(cases_to_run),
        "test_results": results
    }

def run_javascript_code(code: str, test_cases: List[Dict[str, Any]], time_limit_sec: float = 3.0) -> Dict[str, Any]:
    """
    Executes JavaScript code using Node.js against test cases.
    """
    results = []
    passed_count = 0
    total_runtime_ms = 0
    overall_status = "Accepted"
    last_stdout = ""
    last_stderr = ""

    cases_to_run = test_cases if test_cases else [{"input": "", "expected_output": "", "is_hidden": False}]

    for idx, tc in enumerate(cases_to_run):
        input_data = str(tc.get("input", "")).replace("\\n", "\n")
        expected = str(tc.get("expected_output", "")).replace("\\n", "\n").strip()
        is_hidden = bool(tc.get("is_hidden", False))

        with tempfile.NamedTemporaryFile("w", suffix=".js", delete=False, encoding="utf-8") as f:
            f.write(code)
            temp_path = f.name

        start_time = time.perf_counter()
        passed = False
        actual_output = ""
        error_msg = None
        case_runtime_ms = 0

        try:
            process = subprocess.Popen(
                ["node", temp_path],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            stdout, stderr = process.communicate(input=input_data, timeout=time_limit_sec)
            elapsed = time.perf_counter() - start_time
            case_runtime_ms = max(1, int(elapsed * 1000))
            total_runtime_ms += case_runtime_ms

            last_stdout = stdout
            last_stderr = stderr

            if process.returncode != 0:
                overall_status = "Runtime Error"
                error_msg = stderr.strip() if stderr else f"Node process exited with code {process.returncode}"
                actual_output = stdout.strip()
            else:
                actual_output = stdout.strip()
                if not expected or actual_output == expected:
                    passed = True
                    passed_count += 1
                else:
                    passed = False
                    if overall_status == "Accepted":
                        overall_status = "Wrong Answer"
        except subprocess.TimeoutExpired:
            process.kill()
            overall_status = "Time Limit Exceeded"
            error_msg = f"Time Limit Exceeded (> {time_limit_sec}s)"
            case_runtime_ms = int(time_limit_sec * 1000)
            total_runtime_ms += case_runtime_ms
        except Exception as e:
            overall_status = "Runtime Error"
            error_msg = str(e)
        finally:
            try:
                os.remove(temp_path)
            except OSError:
                pass

        results.append({
            "test_case_index": idx + 1,
            "input": input_data if not is_hidden else "[Hidden Test Case]",
            "expected_output": expected if not is_hidden else "[Hidden Test Case]",
            "actual_output": actual_output if not is_hidden else ("[Hidden]" if not passed else "[Passed Hidden]"),
            "passed": passed,
            "runtime_ms": case_runtime_ms,
            "is_hidden": is_hidden,
            "error": error_msg
        })

    avg_runtime = int(total_runtime_ms / len(cases_to_run)) if cases_to_run else 18

    return {
        "status": overall_status if passed_count == len(cases_to_run) else ("Wrong Answer" if overall_status == "Accepted" else overall_status),
        "stdout": last_stdout,
        "stderr": last_stderr,
        "runtime_ms": avg_runtime,
        "memory_mb": round(28.4 + (avg_runtime * 0.03), 1),
        "passed_count": passed_count,
        "total_count": len(cases_to_run),
        "test_results": results
    }

def execute_code(language: str, code: str, test_cases: List[Dict[str, Any]], time_limit_sec: float = 3.0) -> Dict[str, Any]:
    lang = language.lower()
    if lang in ["python", "py", "python3"]:
        return run_python_code(code, test_cases, time_limit_sec)
    elif lang in ["javascript", "js", "typescript", "ts", "node"]:
        return run_javascript_code(code, test_cases, time_limit_sec)
    else:
        # Generic fallback runner
        return run_python_code(code, test_cases, time_limit_sec)
