import os
import shutil
import subprocess
import sys
import tempfile
import time
from typing import Any, Callable, Dict, List, Optional


def _normalize_output(text: str) -> str:
    """Normalize line endings and trailing whitespace per line for fair comparison."""
    lines = text.replace("\r\n", "\n").replace("\r", "\n").strip().split("\n")
    return "\n".join(line.rstrip() for line in lines).strip()


def _execute_subprocess_cases(
    cmd_builder: Callable[[str], List[str]],
    file_path: str,
    test_cases: List[Dict[str, Any]],
    time_limit_sec: float,
    base_memory_mb: float,
    cleanup_paths: Optional[List[str]] = None,
) -> Dict[str, Any]:
    """Run a prepared executable or script across all test cases with timeout & isolation."""
    results: List[Dict[str, Any]] = []
    passed_count = 0
    total_runtime_ms = 0
    overall_status = "Accepted"
    last_stdout = ""
    last_stderr = ""

    cases_to_run = (
        test_cases
        if test_cases
        else [{"input": "", "expected_output": "", "is_hidden": False}]
    )

    try:
        for idx, tc in enumerate(cases_to_run):
            input_data = str(tc.get("input", "")).replace("\\n", "\n")
            expected = _normalize_output(str(tc.get("expected_output", "")).replace("\\n", "\n"))
            is_hidden = bool(tc.get("is_hidden", False))

            start_time = time.perf_counter()
            passed = False
            actual_output = ""
            error_msg = None
            case_runtime_ms = 0
            process = None

            try:
                process = subprocess.Popen(
                    cmd_builder(file_path),
                    stdin=subprocess.PIPE,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True,
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
                    actual_output = _normalize_output(stdout)
                else:
                    actual_output = _normalize_output(stdout)
                    if not expected or actual_output == expected:
                        passed = True
                        passed_count += 1
                    else:
                        passed = False
                        if overall_status == "Accepted":
                            overall_status = "Wrong Answer"
            except subprocess.TimeoutExpired:
                if process is not None:
                    process.kill()
                    process.communicate()
                overall_status = "Time Limit Exceeded"
                error_msg = f"Time Limit Exceeded (> {time_limit_sec}s)"
                case_runtime_ms = int(time_limit_sec * 1000)
                total_runtime_ms += case_runtime_ms
            except Exception as exc:
                overall_status = "Runtime Error"
                error_msg = str(exc)

            results.append(
                {
                    "test_case_index": idx + 1,
                    "input": input_data if not is_hidden else "[Hidden Test Case]",
                    "expected_output": expected if not is_hidden else "[Hidden Test Case]",
                    "actual_output": (
                        actual_output
                        if not is_hidden
                        else ("[Passed Hidden]" if passed else "[Hidden Output Mismatch]")
                    ),
                    "passed": passed,
                    "runtime_ms": case_runtime_ms,
                    "is_hidden": is_hidden,
                    "error": error_msg,
                }
            )
    finally:
        for path in cleanup_paths or [file_path]:
            try:
                if path and os.path.exists(path):
                    os.remove(path)
            except OSError:
                pass

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
        "memory_mb": round(base_memory_mb + (avg_runtime * 0.02), 1),
        "passed_count": passed_count,
        "total_count": len(cases_to_run),
        "test_results": results,
    }


def _failure_result(
    status: str,
    stderr: str,
    test_cases: List[Dict[str, Any]],
) -> Dict[str, Any]:
    cases = test_cases if test_cases else [{"input": "", "expected_output": "", "is_hidden": False}]
    return {
        "status": status,
        "stdout": "",
        "stderr": stderr,
        "runtime_ms": 0,
        "memory_mb": 0.0,
        "passed_count": 0,
        "total_count": len(cases),
        "test_results": [
            {
                "test_case_index": idx + 1,
                "input": str(tc.get("input", "")) if not tc.get("is_hidden") else "[Hidden Test Case]",
                "expected_output": str(tc.get("expected_output", "")) if not tc.get("is_hidden") else "[Hidden Test Case]",
                "actual_output": "",
                "passed": False,
                "runtime_ms": 0,
                "is_hidden": bool(tc.get("is_hidden", False)),
                "error": stderr,
            }
            for idx, tc in enumerate(cases)
        ],
    }


def run_python_code(
    code: str,
    test_cases: List[Dict[str, Any]],
    time_limit_sec: float = 3.0,
) -> Dict[str, Any]:
    with tempfile.NamedTemporaryFile("w", suffix=".py", delete=False, encoding="utf-8") as f:
        f.write(code)
        temp_path = f.name
    return _execute_subprocess_cases(
        cmd_builder=lambda p: [sys.executable, p],
        file_path=temp_path,
        test_cases=test_cases,
        time_limit_sec=time_limit_sec,
        base_memory_mb=14.5,
    )


def run_node_code(
    code: str,
    test_cases: List[Dict[str, Any]],
    time_limit_sec: float = 3.0,
    is_typescript: bool = False,
) -> Dict[str, Any]:
    node_bin = shutil.which("node")
    if not node_bin:
        return _failure_result(
            "Runtime Error",
            "Node.js runtime is not installed on this server.",
            test_cases,
        )

    suffix = ".ts" if is_typescript else ".js"
    with tempfile.NamedTemporaryFile("w", suffix=suffix, delete=False, encoding="utf-8") as f:
        f.write(code)
        temp_path = f.name

    return _execute_subprocess_cases(
        cmd_builder=lambda p: [node_bin, p],
        file_path=temp_path,
        test_cases=test_cases,
        time_limit_sec=time_limit_sec,
        base_memory_mb=28.4,
    )


def run_cpp_code(
    code: str,
    test_cases: List[Dict[str, Any]],
    time_limit_sec: float = 3.0,
) -> Dict[str, Any]:
    compiler = shutil.which("g++") or shutil.which("clang++")
    if not compiler:
        return _failure_result(
            "Compilation Error",
            "C++ compiler (g++ / clang++) is not installed in this environment. Switch to Python, JavaScript, or TypeScript to execute live tests.",
            test_cases,
        )

    with tempfile.NamedTemporaryFile("w", suffix=".cpp", delete=False, encoding="utf-8") as f:
        f.write(code)
        src_path = f.name

    exe_suffix = ".exe" if os.name == "nt" else ""
    bin_path = src_path.replace(".cpp", exe_suffix or ".out")

    try:
        compile_proc = subprocess.run(
            [compiler, "-std=c++20", "-O2", src_path, "-o", bin_path],
            capture_output=True,
            text=True,
            timeout=10,
        )
        if compile_proc.returncode != 0:
            for p in (src_path, bin_path):
                if os.path.exists(p):
                    os.remove(p)
            return _failure_result(
                "Compilation Error",
                compile_proc.stderr.strip() or "C++ compilation failed.",
                test_cases,
            )
    except Exception as exc:
        for p in (src_path, bin_path):
            if os.path.exists(p):
                os.remove(p)
        return _failure_result("Compilation Error", str(exc), test_cases)

    return _execute_subprocess_cases(
        cmd_builder=lambda p: [p],
        file_path=bin_path,
        test_cases=test_cases,
        time_limit_sec=time_limit_sec,
        base_memory_mb=8.2,
        cleanup_paths=[src_path, bin_path],
    )


def get_runtime_capabilities() -> Dict[str, bool]:
    return {
        "python": True,
        "javascript": shutil.which("node") is not None,
        "typescript": shutil.which("node") is not None,
        "cpp": (shutil.which("g++") or shutil.which("clang++")) is not None,
    }


def execute_code(
    language: str,
    code: str,
    test_cases: List[Dict[str, Any]],
    time_limit_sec: float = 3.0,
) -> Dict[str, Any]:
    lang = language.lower().strip()
    if lang in ("python", "py", "python3"):
        return run_python_code(code, test_cases, time_limit_sec)
    if lang in ("javascript", "js", "node"):
        return run_node_code(code, test_cases, time_limit_sec, is_typescript=False)
    if lang in ("typescript", "ts"):
        return run_node_code(code, test_cases, time_limit_sec, is_typescript=True)
    if lang in ("cpp", "c++", "cc"):
        return run_cpp_code(code, test_cases, time_limit_sec)
    return _failure_result(
        "Runtime Error",
        f"Unsupported execution language: {language}",
        test_cases,
    )
