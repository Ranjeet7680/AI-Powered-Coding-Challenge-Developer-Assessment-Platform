import subprocess
import time
import tempfile
import os
import sys
from typing import List, Dict, Any

_SENSITIVE_ENV_KEYS = ("JWT_SECRET_KEY", "GEMINI_API_KEY", "DATABASE_URL", "OPENAI_API_KEY")


def _build_safe_env() -> Dict[str, str]:
    """Return a copy of os.environ with server secrets removed."""
    return {k: v for k, v in os.environ.items() if k not in _SENSITIVE_ENV_KEYS}


def _run_interpreted_code(
    cmd_prefix: List[str],
    suffix: str,
    code: str,
    test_cases: List[Dict[str, Any]],
    time_limit_sec: float = 3.0,
    base_memory_mb: float = 14.5,
    memory_scale: float = 0.02,
) -> Dict[str, Any]:
    """Execute code in a subprocess against each test case."""
    results = []
    passed_count = 0
    total_runtime_ms = 0
    overall_status = "Accepted"
    last_stdout = ""
    last_stderr = ""
    safe_env = _build_safe_env()

    has_explicit_cases = bool(test_cases)
    cases_to_run = test_cases if has_explicit_cases else [{"input": "", "expected_output": "", "is_hidden": False}]

    for idx, tc in enumerate(cases_to_run):
        input_data = str(tc.get("input", "")).replace("\\n", "\n")
        expected = str(tc.get("expected_output", "")).replace("\\n", "\n").strip()
        is_hidden = bool(tc.get("is_hidden", False))

        with tempfile.NamedTemporaryFile("w", suffix=suffix, delete=False, encoding="utf-8") as f:
            f.write(code)
            temp_path = f.name

        start_time = time.perf_counter()
        passed = False
        actual_output = ""
        error_msg = None
        case_runtime_ms = 0
        process = None

        try:
            process = subprocess.Popen(
                [*cmd_prefix, temp_path],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                env=safe_env,
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
                # Empty expected_output only passes for ad-hoc custom-input runs (no explicit test cases)
                if (not has_explicit_cases and not expected) or (expected and actual_output == expected):
                    passed = True
                    passed_count += 1
                elif not expected and has_explicit_cases:
                    passed = False
                    error_msg = "Test case is missing expected_output"
                    if overall_status == "Accepted":
                        overall_status = "Wrong Answer"
                else:
                    passed = False
                    if overall_status == "Accepted":
                        overall_status = "Wrong Answer"
        except subprocess.TimeoutExpired:
            if process is not None:
                process.kill()
                process.communicate()
            last_stdout = ""
            last_stderr = f"Time Limit Exceeded (> {time_limit_sec}s)"
            overall_status = "Time Limit Exceeded"
            error_msg = last_stderr
            case_runtime_ms = int(time_limit_sec * 1000)
            total_runtime_ms += case_runtime_ms
        except Exception as e:
            last_stdout = ""
            last_stderr = str(e)
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
            "error": error_msg,
        })

    avg_runtime = int(total_runtime_ms / len(cases_to_run)) if cases_to_run else 12
    final_status = (
        overall_status
        if passed_count == len(cases_to_run)
        else ("Wrong Answer" if overall_status == "Accepted" else overall_status)
    )

    return {
        "status": final_status,
        "stdout": last_stdout,
        "stderr": last_stderr,
        "runtime_ms": avg_runtime,
        "memory_mb": round(base_memory_mb + (avg_runtime * memory_scale), 1),
        "passed_count": passed_count,
        "total_count": len(cases_to_run),
        "test_results": results,
    }


def run_python_code(code: str, test_cases: List[Dict[str, Any]], time_limit_sec: float = 3.0) -> Dict[str, Any]:
    """Execute Python code against each test case."""
    return _run_interpreted_code([sys.executable], ".py", code, test_cases, time_limit_sec, 14.5, 0.02)


def run_javascript_code(code: str, test_cases: List[Dict[str, Any]], time_limit_sec: float = 3.0) -> Dict[str, Any]:
    """Execute JavaScript code using Node.js against test cases."""
    return _run_interpreted_code(["node"], ".js", code, test_cases, time_limit_sec, 28.4, 0.03)


def execute_code(language: str, code: str, test_cases: List[Dict[str, Any]], time_limit_sec: float = 3.0) -> Dict[str, Any]:
    lang = language.lower().strip()
    if lang in ("python", "py", "python3"):
        return run_python_code(code, test_cases, time_limit_sec)
    if lang in ("javascript", "js", "node"):
        return run_javascript_code(code, test_cases, time_limit_sec)
    return {
        "status": "Runtime Error",
        "stdout": "",
        "stderr": f"Unsupported language '{language}'. Supported languages: python, javascript.",
        "runtime_ms": 0,
        "memory_mb": 0.0,
        "passed_count": 0,
        "total_count": len(test_cases),
        "test_results": [],
    }
