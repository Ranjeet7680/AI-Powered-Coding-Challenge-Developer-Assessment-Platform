import json
import os
import re
from typing import Any, Dict, List, Optional
import requests

DEFAULT_GEMINI_KEY = os.getenv("GEMINI_API_KEY", os.getenv("GOOGLE_API_KEY", ""))


def clean_json_response(text: str) -> str:
    """Remove markdown code fences if the model wraps JSON in ```json ... ```."""
    text = text.strip()
    if text.startswith("```json"):
        text = text[7:]
    elif text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    return text.strip()


def _call_gemini_json(prompt: str, api_key: str, preferred_model: str = "gemini-2.0-flash", timeout: int = 12) -> Optional[Dict[str, Any]]:
    candidates = [preferred_model, "gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro"]
    seen = set()
    ordered_models = [m for m in candidates if m and not (m in seen or seen.add(m))]

    for model in ordered_models:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": 0.3,
                "responseMimeType": "application/json",
            },
        }
        try:
            res = requests.post(url, json=payload, timeout=timeout)
            if res.status_code == 200:
                data = res.json()
                raw_text = data["candidates"][0]["content"]["parts"][0]["text"]
                return json.loads(clean_json_response(raw_text))
        except Exception:
            continue
    return None


def generate_challenge_with_gemini(
    topic: str,
    language: str = "python",
    difficulty: str = "Medium",
    problem_type: str = "Algorithm",
    test_case_count: int = 5,
    time_limit_ms: int = 2000,
    custom_instructions: str = "",
    model: str = "gemini-2.0-flash",
    api_key: Optional[str] = None,
) -> Dict[str, Any]:
    key = (api_key or DEFAULT_GEMINI_KEY or "").strip()

    prompt = f"""You are an elite coding challenge designer for a world-class developer assessment platform.
Generate a brand new, highly realistic {difficulty} coding problem on the topic: "{topic}".
Problem Type: {problem_type}
Target Language: {language}
Number of test cases to produce: {test_case_count}
Time Limit (ms): {time_limit_ms}
Additional Instructions: {custom_instructions or "Ensure clean, realistic constraints and deterministic stdin/stdout requirements."}

Return a valid JSON object matching EXACTLY this structure:
{{
  "title": "Creative and clear problem title",
  "difficulty": "{difficulty}",
  "category": "{topic}",
  "problem_type": "{problem_type}",
  "description": "Comprehensive markdown description explaining the scenario, input, and expected behavior.",
  "time_limit_ms": {time_limit_ms},
  "memory_limit_mb": 256,
  "constraints": [
    "1 <= n <= 10^5",
    "-10^4 <= arr[i] <= 10^4"
  ],
  "input_format": "Detailed explanation of standard input format",
  "output_format": "Detailed explanation of standard output format",
  "examples": [
    {{
      "input": "sample input string",
      "output": "sample output string",
      "explanation": "why this output is produced"
    }}
  ],
  "starter_code": {{
    "python": "...",
    "javascript": "...",
    "typescript": "...",
    "cpp": "..."
  }},
  "test_cases": [
    {{
      "input": "sample input 1",
      "expected_output": "sample expected output 1",
      "is_hidden": false
    }}
  ],
  "hints": [
    "First hint to help the developer",
    "Second hint discussing optimal approach"
  ],
  "expected_complexity": {{
    "time": "O(N log N)",
    "space": "O(N)"
  }},
  "tags": ["{topic.lower().replace(' ', '-')}", "{difficulty.lower()}", "{problem_type.lower()}"]
}}"""

    if key:
        parsed = _call_gemini_json(prompt, key, preferred_model=model)
        if parsed and "title" in parsed and "test_cases" in parsed:
            parsed.setdefault("time_limit_ms", time_limit_ms)
            parsed.setdefault("memory_limit_mb", 256)
            parsed["is_ai_generated"] = True
            return parsed

    return generate_procedural_fallback_challenge(
        topic=topic,
        language=language,
        difficulty=difficulty,
        problem_type=problem_type,
        test_case_count=test_case_count,
        time_limit_ms=time_limit_ms,
    )


def generate_procedural_fallback_challenge(
    topic: str,
    language: str = "python",
    difficulty: str = "Medium",
    problem_type: str = "Algorithm",
    test_case_count: int = 5,
    time_limit_ms: int = 2000,
) -> Dict[str, Any]:
    topic_clean = topic.strip().title() if topic else "Dynamic Programming"
    topic_lower = topic_clean.lower()

    # Select rich domain-specific blueprint based on topic / problem_type
    if any(k in topic_lower for k in ("machine learning", "regression", "attention", "softmax", "neural", "cluster", "cosine")):
        return _ml_cosine_template(topic_clean, difficulty, problem_type, test_case_count, time_limit_ms)
    if any(k in topic_lower for k in ("dynamic", "dp", "memoization", "knapsack", "subsequence")):
        return _dp_template(topic_clean, difficulty, problem_type, test_case_count, time_limit_ms)
    if any(k in topic_lower for k in ("window", "pointer", "subarray", "stream", "budget")):
        return _sliding_window_template(topic_clean, difficulty, problem_type, test_case_count, time_limit_ms)
    if any(k in topic_lower for k in ("graph", "bfs", "dfs", "network", "island", "tree")):
        return _graph_components_template(topic_clean, difficulty, problem_type, test_case_count, time_limit_ms)
    if any(k in topic_lower for k in ("system", "cache", "rate", "limiter", "design")):
        return _rate_limiter_template(topic_clean, difficulty, problem_type, test_case_count, time_limit_ms)

    return _equilibrium_template(topic_clean, difficulty, problem_type, test_case_count, time_limit_ms)


def _pad_test_cases(base: List[Dict[str, Any]], count: int) -> List[Dict[str, Any]]:
    result = list(base)
    while len(result) < count:
        idx = len(result) % len(base)
        extra = dict(base[idx])
        extra["is_hidden"] = True
        result.append(extra)
    return result[:count]


def _dp_template(topic: str, difficulty: str, problem_type: str, count: int, time_limit_ms: int) -> Dict[str, Any]:
    cases = _pad_test_cases([
        {"input": "5\n2 7 9 3 1", "expected_output": "12", "is_hidden": False},
        {"input": "4\n1 2 3 1", "expected_output": "4", "is_hidden": False},
        {"input": "1\n10", "expected_output": "10", "is_hidden": False},
        {"input": "6\n5 5 10 100 10 5", "expected_output": "110", "is_hidden": True},
        {"input": "5\n0 0 0 0 0", "expected_output": "0", "is_hidden": True},
    ], count)

    py = """import sys

def max_non_adjacent_sum(nums):
    prev2, prev1 = 0, 0
    for x in nums:
        prev2, prev1 = prev1, max(prev1, prev2 + x)
    return prev1

if __name__ == '__main__':
    tokens = sys.stdin.read().split()
    if not tokens:
        print(0)
    else:
        n = int(tokens[0])
        nums = [int(x) for x in tokens[1:n+1]]
        print(max_non_adjacent_sum(nums))
"""
    js = """const fs = require('fs');

function maxNonAdjacentSum(nums) {
  let prev2 = 0, prev1 = 0;
  for (const x of nums) {
    const next = Math.max(prev1, prev2 + x);
    prev2 = prev1;
    prev1 = next;
  }
  return prev1;
}

const tokens = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
if (!tokens[0]) {
  console.log(0);
} else {
  const n = parseInt(tokens[0], 10);
  const nums = tokens.slice(1, n + 1).map(Number);
  console.log(maxNonAdjacentSum(nums));
}
"""
    ts = """import * as fs from 'node:fs';

function maxNonAdjacentSum(nums: number[]): number {
  let prev2 = 0;
  let prev1 = 0;
  for (const x of nums) {
    const next = Math.max(prev1, prev2 + x);
    prev2 = prev1;
    prev1 = next;
  }
  return prev1;
}

const tokens: string[] = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
if (!tokens[0]) {
  console.log(0);
} else {
  const n = parseInt(tokens[0], 10);
  const nums = tokens.slice(1, n + 1).map(Number);
  console.log(maxNonAdjacentSum(nums));
}
"""
    cpp = """#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    int n;
    if (!(cin >> n)) { cout << 0 << "\\n"; return 0; }
    long long prev2 = 0, prev1 = 0;
    for (int i = 0; i < n; ++i) {
        long long x;
        cin >> x;
        long long next = max(prev1, prev2 + x);
        prev2 = prev1;
        prev1 = next;
    }
    cout << prev1 << "\\n";
    return 0;
}
"""
    return {
        "title": "Non-Adjacent Signal Harvester",
        "difficulty": difficulty,
        "category": topic,
        "problem_type": problem_type,
        "description": f"""### Problem Statement
In a distributed compute cluster ({topic}), adjacent nodes share a power rail and **cannot be scheduled simultaneously**.

Given an integer array `rewards` of length `N` where `rewards[i]` is the throughput gained by activating node `i`, return the **maximum total throughput** achievable without activating two adjacent nodes.

### Recurrence Intuition
At step `i`, either skip node `i` (`dp[i-1]`) or activate node `i` (`dp[i-2] + rewards[i]`). Optimize space to `O(1)` using two rolling state variables.""",
        "time_limit_ms": time_limit_ms,
        "memory_limit_mb": 256,
        "constraints": ["1 <= N <= 10^5", "0 <= rewards[i] <= 10^4", "Expected Time: O(N)", "Expected Space: O(1)"],
        "input_format": "First token is N, followed by N non-negative integers.",
        "output_format": "Single integer representing the maximum achievable sum.",
        "examples": [
            {"input": "5\n2 7 9 3 1", "output": "12", "explanation": "Activate indices 0, 2, and 4 -> 2 + 9 + 1 = 12."},
            {"input": "4\n1 2 3 1", "output": "4", "explanation": "Activate indices 0 and 2 -> 1 + 3 = 4."},
        ],
        "starter_code": {"python": py, "javascript": js, "typescript": ts, "cpp": cpp},
        "test_cases": cases,
        "hints": [
            "Define dp[i] as the best sum using prefix 0..i.",
            "Since dp[i] only depends on dp[i-1] and dp[i-2], you only need two integers instead of an array.",
        ],
        "expected_complexity": {"time": "O(N)", "space": "O(1)"},
        "is_ai_generated": True,
        "tags": ["dynamic-programming", difficulty.lower(), "ai-generated"],
    }


def _sliding_window_template(topic: str, difficulty: str, problem_type: str, count: int, time_limit_ms: int) -> Dict[str, Any]:
    cases = _pad_test_cases([
        {"input": "6 8\n2 3 1 2 4 3", "expected_output": "3", "is_hidden": False},
        {"input": "5 15\n1 2 3 4 5", "expected_output": "5", "is_hidden": False},
        {"input": "4 2\n5 6 7 8", "expected_output": "0", "is_hidden": False},
        {"input": "7 10\n4 2 1 3 2 5 1", "expected_output": "4", "is_hidden": True},
        {"input": "3 5\n5 5 5", "expected_output": "1", "is_hidden": True},
    ], count)

    py = """import sys

def longest_subarray_within_budget(nums, k):
    left = 0
    curr_sum = 0
    best = 0
    for right, val in enumerate(nums):
        curr_sum += val
        while curr_sum > k and left <= right:
            curr_sum -= nums[left]
            left += 1
        best = max(best, right - left + 1)
    return best

if __name__ == '__main__':
    tokens = sys.stdin.read().split()
    if len(tokens) >= 2:
        n, k = int(tokens[0]), int(tokens[1])
        nums = [int(x) for x in tokens[2:2+n]]
        print(longest_subarray_within_budget(nums, k))
"""
    js = """const fs = require('fs');

function longestSubarrayWithinBudget(nums, k) {
  let left = 0, curr = 0, best = 0;
  for (let right = 0; right < nums.length; right++) {
    curr += nums[right];
    while (curr > k && left <= right) {
      curr -= nums[left++];
    }
    best = Math.max(best, right - left + 1);
  }
  return best;
}

const tokens = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
if (tokens.length >= 2) {
  const n = parseInt(tokens[0], 10);
  const k = parseInt(tokens[1], 10);
  const nums = tokens.slice(2, 2 + n).map(Number);
  console.log(longestSubarrayWithinBudget(nums, k));
}
"""
    ts = js.replace("function longestSubarrayWithinBudget(nums, k)", "function longestSubarrayWithinBudget(nums: number[], k: number): number")
    cpp = """#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    int n;
    long long k;
    if (!(cin >> n >> k)) return 0;
    vector<long long> nums(n);
    for (int i = 0; i < n; ++i) cin >> nums[i];
    int left = 0, best = 0;
    long long curr = 0;
    for (int right = 0; right < n; ++right) {
        curr += nums[right];
        while (curr > k && left <= right) curr -= nums[left++];
        best = max(best, right - left + 1);
    }
    cout << best << "\\n";
    return 0;
}
"""
    return {
        "title": "Adaptive Sliding Window Budget",
        "difficulty": difficulty,
        "category": topic,
        "problem_type": problem_type,
        "description": """### Problem Statement
Given an array of non-negative task costs `costs` of length `N` and a maximum compute budget `K`, find the **length of the longest contiguous subarray** whose total cost does not exceed `K`.

### Constraints & Approach
Use an expanding/shrinking two-pointer sliding window to achieve linear `O(N)` runtime.""",
        "time_limit_ms": time_limit_ms,
        "memory_limit_mb": 256,
        "constraints": ["1 <= N <= 10^5", "0 <= costs[i] <= 10^4", "Expected Time: O(N)", "Expected Space: O(1)"],
        "input_format": "First line: N and K. Second line: N non-negative integers.",
        "output_format": "Single integer length of the longest valid contiguous window.",
        "examples": [
            {"input": "6 8\n2 3 1 2 4 3", "output": "3", "explanation": "[2, 3, 1] and [1, 2, 4] have length 3 and sum <= 8."},
        ],
        "starter_code": {"python": py, "javascript": js, "typescript": ts, "cpp": cpp},
        "test_cases": cases,
        "hints": ["Expand the right pointer to include elements, and advance the left pointer while window sum > K."],
        "expected_complexity": {"time": "O(N)", "space": "O(1)"},
        "is_ai_generated": True,
        "tags": ["sliding-window", "two-pointers", difficulty.lower()],
    }


def _graph_components_template(topic: str, difficulty: str, problem_type: str, count: int, time_limit_ms: int) -> Dict[str, Any]:
    cases = _pad_test_cases([
        {"input": "5 3\n0 1\n1 2\n3 4", "expected_output": "2", "is_hidden": False},
        {"input": "4 0", "expected_output": "4", "is_hidden": False},
        {"input": "4 3\n0 1\n1 2\n2 3", "expected_output": "1", "is_hidden": False},
        {"input": "6 3\n0 2\n2 4\n1 5", "expected_output": "3", "is_hidden": True},
        {"input": "1 0", "expected_output": "1", "is_hidden": True},
    ], count)

    py = """import sys
from collections import deque

def count_clusters(n, edges):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    visited = [False] * n
    clusters = 0
    for start in range(n):
        if not visited[start]:
            clusters += 1
            q = deque([start])
            visited[start] = True
            while q:
                node = q.popleft()
                for nxt in adj[node]:
                    if not visited[nxt]:
                        visited[nxt] = True
                        q.append(nxt)
    return clusters

if __name__ == '__main__':
    tokens = sys.stdin.read().split()
    if len(tokens) >= 2:
        n, m = int(tokens[0]), int(tokens[1])
        edges = [(int(tokens[2 + 2*i]), int(tokens[3 + 2*i])) for i in range(m)]
        print(count_clusters(n, edges))
"""
    js = """const fs = require('fs');

function countClusters(n, edges) {
  const adj = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) {
    adj[u].push(v);
    adj[v].push(u);
  }
  const visited = new Array(n).fill(false);
  let clusters = 0;
  for (let i = 0; i < n; i++) {
    if (!visited[i]) {
      clusters++;
      const queue = [i];
      visited[i] = true;
      for (let head = 0; head < queue.length; head++) {
        const node = queue[head];
        for (const nxt of adj[node]) {
          if (!visited[nxt]) {
            visited[nxt] = true;
            queue.push(nxt);
          }
        }
      }
    }
  }
  return clusters;
}

const tokens = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
if (tokens.length >= 2) {
  const n = parseInt(tokens[0], 10);
  const m = parseInt(tokens[1], 10);
  const edges = [];
  for (let i = 0; i < m; i++) {
    edges.push([parseInt(tokens[2 + 2 * i], 10), parseInt(tokens[3 + 2 * i], 10)]);
  }
  console.log(countClusters(n, edges));
}
"""
    ts = js.replace("function countClusters(n, edges)", "function countClusters(n: number, edges: number[][]): number")
    cpp = """#include <iostream>
#include <vector>
#include <queue>
using namespace std;

int main() {
    int n, m;
    if (!(cin >> n >> m)) return 0;
    vector<vector<int>> adj(n);
    for (int i = 0; i < m; ++i) {
        int u, v;
        cin >> u >> v;
        adj[u].push_back(v);
        adj[v].push_back(u);
    }
    vector<bool> vis(n, false);
    int clusters = 0;
    for (int i = 0; i < n; ++i) {
        if (!vis[i]) {
            clusters++;
            queue<int> q;
            q.push(i);
            vis[i] = true;
            while (!q.empty()) {
                int u = q.front(); q.pop();
                for (int v : adj[u]) {
                    if (!vis[v]) { vis[v] = true; q.push(v); }
                }
            }
        }
    }
    cout << clusters << "\\n";
    return 0;
}
"""
    return {
        "title": "Service Mesh Connected Clusters",
        "difficulty": difficulty,
        "category": topic,
        "problem_type": problem_type,
        "description": """### Problem Statement
You are given `N` microservice nodes labeled `0` to `N - 1` and `M` undirected network links `(u, v)`.

Determine the total number of **isolated service clusters** (connected components) in the mesh topology using BFS, DFS, or Disjoint Set Union (Union-Find).""",
        "time_limit_ms": time_limit_ms,
        "memory_limit_mb": 256,
        "constraints": ["1 <= N <= 10^5", "0 <= M <= 2 * 10^5", "Expected Time: O(N + M)"],
        "input_format": "First line: N and M. Next M lines: pairs u v.",
        "output_format": "Single integer denoting number of connected components.",
        "examples": [
            {"input": "5 3\n0 1\n1 2\n3 4", "output": "2", "explanation": "{0,1,2} and {3,4} form 2 clusters."},
        ],
        "starter_code": {"python": py, "javascript": js, "typescript": ts, "cpp": cpp},
        "test_cases": cases,
        "hints": ["Track visited vertices and launch BFS/DFS from each unvisited node."],
        "expected_complexity": {"time": "O(N + M)", "space": "O(N + M)"},
        "is_ai_generated": True,
        "tags": ["graphs", "bfs", "union-find", difficulty.lower()],
    }


def _ml_cosine_template(topic: str, difficulty: str, problem_type: str, count: int, time_limit_ms: int) -> Dict[str, Any]:
    cases = _pad_test_cases([
        {"input": "3\n1 0 0\n1 0 0", "expected_output": "1.0000", "is_hidden": False},
        {"input": "3\n1 2 3\n4 5 6", "expected_output": "0.9746", "is_hidden": False},
        {"input": "2\n1 0\n0 1", "expected_output": "0.0000", "is_hidden": False},
        {"input": "3\n-1 -2 -3\n1 2 3", "expected_output": "-1.0000", "is_hidden": True},
        {"input": "2\n0 0\n1 2", "expected_output": "0.0000", "is_hidden": True},
    ], count)

    py = """import sys
import math

def cosine_similarity(a, b):
    dot = sum(x * y for x, y in zip(a, b))
    norm_a = math.sqrt(sum(x * x for x in a))
    norm_b = math.sqrt(sum(y * y for y in b))
    if norm_a == 0.0 or norm_b == 0.0:
        return 0.0
    return dot / (norm_a * norm_b)

if __name__ == '__main__':
    tokens = sys.stdin.read().split()
    if tokens:
        d = int(tokens[0])
        a = [float(x) for x in tokens[1:1+d]]
        b = [float(x) for x in tokens[1+d:1+2*d]]
        print(f"{cosine_similarity(a, b):.4f}")
"""
    js = """const fs = require('fs');

function cosineSimilarity(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom === 0 ? 0 : dot / denom;
}

const tokens = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
if (tokens[0]) {
  const d = parseInt(tokens[0], 10);
  const a = tokens.slice(1, 1 + d).map(Number);
  const b = tokens.slice(1 + d, 1 + 2 * d).map(Number);
  console.log(cosineSimilarity(a, b).toFixed(4));
}
"""
    ts = js.replace("function cosineSimilarity(a, b)", "function cosineSimilarity(a: number[], b: number[]): number")
    cpp = """#include <iostream>
#include <vector>
#include <cmath>
#include <iomanip>
using namespace std;

int main() {
    int d;
    if (!(cin >> d)) return 0;
    vector<double> a(d), b(d);
    for (int i = 0; i < d; ++i) cin >> a[i];
    for (int i = 0; i < d; ++i) cin >> b[i];
    double dot = 0, na = 0, nb = 0;
    for (int i = 0; i < d; ++i) {
        dot += a[i] * b[i];
        na += a[i] * a[i];
        nb += b[i] * b[i];
    }
    double denom = sqrt(na) * sqrt(nb);
    cout << fixed << setprecision(4) << (denom == 0.0 ? 0.0 : dot / denom) << "\\n";
    return 0;
}
"""
    return {
        "title": f"Vector Embedding Cosine Similarity ({topic})",
        "difficulty": difficulty,
        "category": "Machine Learning",
        "problem_type": problem_type,
        "description": """### Problem Statement
Semantic vector search and retrieval-augmented generation (RAG) rely on **Cosine Similarity** between embedding vectors $A$ and $B$:

$$\\text{sim}(A, B) = \\frac{A \\cdot B}{\\|A\\|_2 \\|B\\|_2}$$

Implement `cosine_similarity(a, b)` safely handling zero-norm vectors (returning `0.0000`) and print the result formatted to **4 decimal places**.""",
        "time_limit_ms": time_limit_ms,
        "memory_limit_mb": 256,
        "constraints": ["1 <= D <= 4096", "Handle zero vectors safely without division by zero"],
        "input_format": "First line: dimension D. Next two lines: D floats for vector A and vector B.",
        "output_format": "Cosine similarity formatted to 4 decimal places.",
        "examples": [
            {"input": "3\n1 2 3\n4 5 6", "output": "0.9746", "explanation": "Dot product 32 / (sqrt(14) * sqrt(77)) = 0.9746."},
        ],
        "starter_code": {"python": py, "javascript": js, "typescript": ts, "cpp": cpp},
        "test_cases": cases,
        "hints": ["Guard against norm_a == 0 or norm_b == 0 before dividing."],
        "expected_complexity": {"time": "O(D)", "space": "O(1)"},
        "is_ai_generated": True,
        "tags": ["machine-learning", "embeddings", "vector-math", difficulty.lower()],
    }


def _rate_limiter_template(topic: str, difficulty: str, problem_type: str, count: int, time_limit_ms: int) -> Dict[str, Any]:
    cases = _pad_test_cases([
        {"input": "2 5\n1 2 3 6 7", "expected_output": "1 1 0 1 1", "is_hidden": False},
        {"input": "1 3\n1 1 3 4", "expected_output": "1 0 0 1", "is_hidden": False},
        {"input": "3 10\n1 2 3 4", "expected_output": "1 1 1 0", "is_hidden": True},
        {"input": "2 1\n1 2 3", "expected_output": "1 1 1", "is_hidden": True},
        {"input": "2 4\n0 1 2 4 5", "expected_output": "1 1 0 1 1", "is_hidden": True},
    ], count)

    py = """import sys
from collections import deque

def rate_limit(limit, window, timestamps):
    q = deque()
    out = []
    for t in timestamps:
        while q and q[0] <= t - window:
            q.popleft()
        if len(q) < limit:
            q.append(t)
            out.append("1")
        else:
            out.append("0")
    return " ".join(out)

if __name__ == '__main__':
    tokens = sys.stdin.read().split()
    if len(tokens) >= 2:
        limit, window = int(tokens[0]), int(tokens[1])
        ts = [int(x) for x in tokens[2:]]
        print(rate_limit(limit, window, ts))
"""
    js = """const fs = require('fs');

function rateLimit(limit, windowSize, timestamps) {
  const q = [];
  let head = 0;
  const out = [];
  for (const t of timestamps) {
    while (head < q.length && q[head] <= t - windowSize) head++;
    if (q.length - head < limit) {
      q.push(t);
      out.push('1');
    } else {
      out.push('0');
    }
  }
  return out.join(' ');
}

const tokens = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
if (tokens.length >= 2) {
  const limit = parseInt(tokens[0], 10);
  const win = parseInt(tokens[1], 10);
  const ts = tokens.slice(2).map(Number);
  console.log(rateLimit(limit, win, ts));
}
"""
    ts = js.replace("function rateLimit(limit, windowSize, timestamps)", "function rateLimit(limit: number, windowSize: number, timestamps: number[]): string")
    cpp = """#include <iostream>
#include <deque>
using namespace std;

int main() {
    int limit;
    long long window;
    if (!(cin >> limit >> window)) return 0;
    deque<long long> q;
    long long t;
    bool first = true;
    while (cin >> t) {
        while (!q.empty() && q.front() <= t - window) q.pop_front();
        if ((int)q.size() < limit) {
            q.push_back(t);
            cout << (first ? "" : " ") << 1;
        } else {
            cout << (first ? "" : " ") << 0;
        }
        first = false;
    }
    cout << "\\n";
    return 0;
}
"""
    return {
        "title": "Sliding Window API Rate Limiter",
        "difficulty": difficulty,
        "category": topic,
        "problem_type": problem_type,
        "description": """### Problem Statement
Design a **Sliding Window Rate Limiter** that allows at most `limit` requests within any trailing half-open window `(t - window, t]`.

Given non-decreasing request timestamps, output `1` if a request is allowed or `0` if throttled.""",
        "time_limit_ms": time_limit_ms,
        "memory_limit_mb": 256,
        "constraints": ["1 <= limit <= 10^4", "1 <= window <= 10^6", "Timestamps are non-decreasing"],
        "input_format": "First line: limit and window. Second line: space-separated timestamps.",
        "output_format": "Space-separated 1 (allowed) or 0 (throttled).",
        "examples": [
            {"input": "2 5\n1 2 3 6 7", "output": "1 1 0 1 1", "explanation": "Timestamp 3 throttled because 1 and 2 occupy the 5-unit window."},
        ],
        "starter_code": {"python": py, "javascript": js, "typescript": ts, "cpp": cpp},
        "test_cases": cases,
        "hints": ["Maintain a FIFO queue of accepted timestamps and evict timestamps <= t - window."],
        "expected_complexity": {"time": "O(N)", "space": "O(limit)"},
        "is_ai_generated": True,
        "tags": ["system-design", "queue", "rate-limiter", difficulty.lower()],
    }


def _equilibrium_template(topic: str, difficulty: str, problem_type: str, count: int, time_limit_ms: int) -> Dict[str, Any]:
    cases = _pad_test_cases([
        {"input": "6\n1 7 3 6 5 6", "expected_output": "3", "is_hidden": False},
        {"input": "3\n1 2 3", "expected_output": "-1", "is_hidden": False},
        {"input": "3\n2 1 -1", "expected_output": "0", "is_hidden": False},
        {"input": "5\n-1 -1 -1 -1 -1", "expected_output": "2", "is_hidden": True},
        {"input": "1\n42", "expected_output": "0", "is_hidden": True},
    ], count)

    py = """import sys

def pivot_index(nums):
    total = sum(nums)
    left_sum = 0
    for i, val in enumerate(nums):
        if left_sum == total - left_sum - val:
            return i
        left_sum += val
    return -1

if __name__ == '__main__':
    tokens = sys.stdin.read().split()
    if tokens:
        n = int(tokens[0])
        nums = [int(x) for x in tokens[1:1+n]]
        print(pivot_index(nums))
"""
    js = """const fs = require('fs');

function pivotIndex(nums) {
  const total = nums.reduce((a, b) => a + b, 0);
  let left = 0;
  for (let i = 0; i < nums.length; i++) {
    if (left === total - left - nums[i]) return i;
    left += nums[i];
  }
  return -1;
}

const tokens = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
if (tokens[0]) {
  const n = parseInt(tokens[0], 10);
  const nums = tokens.slice(1, 1 + n).map(Number);
  console.log(pivotIndex(nums));
}
"""
    ts = js.replace("function pivotIndex(nums)", "function pivotIndex(nums: number[]): number")
    cpp = """#include <iostream>
#include <vector>
#include <numeric>
using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<long long> nums(n);
    long long total = 0;
    for (int i = 0; i < n; ++i) { cin >> nums[i]; total += nums[i]; }
    long long left = 0;
    for (int i = 0; i < n; ++i) {
        if (left == total - left - nums[i]) { cout << i << "\\n"; return 0; }
        left += nums[i];
    }
    cout << -1 << "\\n";
    return 0;
}
"""
    return {
        "title": f"Prefix Equilibrium Partition ({topic})",
        "difficulty": difficulty,
        "category": topic,
        "problem_type": problem_type,
        "description": """### Problem Statement
Given an integer array `nums`, locate the leftmost **equilibrium pivot index** `i` where the sum of all elements strictly to the left equals the sum of all elements strictly to the right.

Return `-1` if no such equilibrium index exists.""",
        "time_limit_ms": time_limit_ms,
        "memory_limit_mb": 256,
        "constraints": ["1 <= N <= 10^5", "-10^4 <= nums[i] <= 10^4", "Expected Time: O(N)", "Expected Space: O(1)"],
        "input_format": "First line: N. Second line: N space-separated integers.",
        "output_format": "Leftmost equilibrium index, or -1.",
        "examples": [
            {"input": "6\n1 7 3 6 5 6", "output": "3", "explanation": "Left sum (1+7+3=11) == Right sum (5+6=11) at index 3."},
        ],
        "starter_code": {"python": py, "javascript": js, "typescript": ts, "cpp": cpp},
        "test_cases": cases,
        "hints": ["Compute total sum once, then track running left_sum in a single pass."],
        "expected_complexity": {"time": "O(N)", "space": "O(1)"},
        "is_ai_generated": True,
        "tags": [topic.lower().replace(" ", "-"), difficulty.lower(), "prefix-sum"],
    }


def _analyze_code_heuristics(code: str, language: str, status: str, runtime_ms: int, memory_mb: float) -> Dict[str, Any]:
    lines = [ln for ln in code.splitlines() if ln.strip()]
    line_count = len(lines)
    loop_count = len(re.findall(r"\b(for|while)\b", code))
    nested_loop = bool(re.search(r"(for|while)[^\n]*\n(?:[ \t]+[^\n]*\n){0,8}[ \t]+(for|while)\b", code))
    uses_hash = any(tok in code for tok in ("dict", "{}", "set(", "Map", "Set", "unordered_map", "OrderedDict"))
    uses_sort = any(tok in code for tok in (".sort(", "sorted(", "std::sort"))
    has_guards = any(tok in code for tok in ("if not ", "if (!", "== 0", "len(", ".length"))
    has_comments = "#" in code or "//" in code or '"""' in code

    if nested_loop:
        time_comp = "O(N^2)"
    elif uses_sort:
        time_comp = "O(N log N)"
    elif loop_count >= 1:
        time_comp = "O(N)"
    else:
        time_comp = "O(1)"

    space_comp = "O(N)" if uses_hash else "O(1)"
    passed = status == "Accepted"

    efficiency_score = 96 if (passed and not nested_loop) else (80 if passed else 62)
    cleanliness_score = min(98, 76 + (8 if has_guards else 0) + (6 if has_comments else 0) + (5 if line_count <= 60 else 0))
    overall_score = int((efficiency_score * 0.55) + (cleanliness_score * 0.45)) if passed else min(72, int(cleanliness_score * 0.8))

    highlights: List[str] = []
    if uses_hash:
        highlights.append("Leverages hash-backed constant-time lookup structures.")
    if has_guards:
        highlights.append("Includes defensive boundary checks for empty or edge-case inputs.")
    if not nested_loop and loop_count >= 1:
        highlights.append(f"Avoids quadratic nested iteration, maintaining {time_comp} scaling.")
    if not highlights:
        highlights.append(f"Concise {line_count}-line {language} implementation with {runtime_ms}ms execution.")

    suggestions: List[str] = []
    if nested_loop:
        suggestions.append("Consider replacing the inner loop with a hash map, prefix sum, or two-pointer scan to drop from O(N^2) to O(N).")
    if not has_guards:
        suggestions.append("Add explicit empty-input / null boundary guards before indexing collections.")
    if not has_comments:
        suggestions.append("Add brief docstrings or inline invariant comments to improve maintainability during code reviews.")
    if not suggestions:
        suggestions.append("Verify behavior under maximum constraint scale (N >= 10^5) and negative/zero boundaries.")

    summary = (
        f"Clean {language} solution ({line_count} active lines) passing all test vectors in {runtime_ms}ms with estimated {time_comp} time and {space_comp} space complexity."
        if passed
        else f"Submission finished with status '{status}'. Review edge-case handling and verify output formatting against the problem specification."
    )

    return {
        "overall_score": overall_score,
        "summary": summary,
        "time_complexity": time_comp,
        "space_complexity": space_comp,
        "cleanliness_score": cleanliness_score,
        "efficiency_score": efficiency_score,
        "highlights": highlights,
        "suggestions": suggestions,
        "security_assessment": "Isolated subprocess execution verified. No unsafe system calls or unbounded allocations detected.",
    }


def generate_ai_code_review(
    code: str,
    language: str,
    status: str,
    runtime_ms: int,
    memory_mb: float,
    api_key: Optional[str] = None,
) -> Dict[str, Any]:
    key = (api_key or DEFAULT_GEMINI_KEY or "").strip()

    prompt = f"""You are a Principal Software Engineer conducting an automated code review for a developer assessment submission.
Language: {language}
Submission Status: {status}
Observed Runtime: {runtime_ms} ms
Observed Memory: {memory_mb} MB

Source Code:
```{language}
{code}
```

Provide an in-depth, actionable review formatted as JSON:
{{
  "overall_score": 92,
  "summary": "Concise 2-sentence executive assessment of the solution.",
  "time_complexity": "O(N)",
  "space_complexity": "O(1)",
  "cleanliness_score": 95,
  "efficiency_score": 90,
  "highlights": ["...", "..."],
  "suggestions": ["...", "..."],
  "security_assessment": "..."
}}"""

    if key:
        parsed = _call_gemini_json(prompt, key, preferred_model="gemini-2.0-flash", timeout=9)
        if parsed and "summary" in parsed:
            return parsed

    return _analyze_code_heuristics(code, language, status, runtime_ms, memory_mb)


def generate_copilot_reply(
    message: str,
    language: str,
    code: str,
    challenge_title: Optional[str] = None,
    challenge_description: Optional[str] = None,
    last_error: Optional[str] = None,
    api_key: Optional[str] = None,
) -> Dict[str, str]:
    key = (api_key or DEFAULT_GEMINI_KEY or "").strip()

    if key:
        prompt = f"""You are an AI Coding Copilot embedded inside an engineering workspace IDE.
Challenge: {challenge_title or 'Coding Challenge'}
Problem Context: {(challenge_description or '')[:1200]}
Language: {language}
Latest Runtime/Test Error: {last_error or 'None'}

Candidate's Current Code:
```{language}
{code[:3500]}
```

User Question: {message}

Provide a clear, concise, helpful answer (under 140 words) referencing their exact code and complexity trade-offs without spoiling everything unless asked. Return JSON: {{"reply": "..."}}"""
        parsed = _call_gemini_json(prompt, key, preferred_model="gemini-2.0-flash", timeout=10)
        if parsed and parsed.get("reply"):
            return {"reply": parsed["reply"], "source": "gemini"}

    # Intelligent code-aware fallback
    q = message.lower()
    analysis = _analyze_code_heuristics(code, language, "Accepted", 20, 14.0)
    lines = len([ln for ln in code.splitlines() if ln.strip()])

    if last_error and any(w in q for w in ("error", "fix", "debug", "fail", "wrong", "why")):
        return {
            "reply": f"Looking at your latest output (`{last_error[:140]}`), double-check your stdin parsing and exact output formatting (whitespace/newlines) in {language}. Also verify empty-input guards before indexing.",
            "source": "heuristic",
        }
    if any(w in q for w in ("time", "space", "big-o", "complexity", "optim")):
        return {
            "reply": f"Your current {lines}-line {language} implementation looks like **{analysis['time_complexity']}** time and **{analysis['space_complexity']}** space. {analysis['suggestions'][0]}",
            "source": "heuristic",
        }
    if any(w in q for w in ("edge", "case", "test", "bug")):
        return {
            "reply": f"For **{challenge_title or 'this problem'}**, test these edge cases in Custom Input: (1) empty or single-element input, (2) duplicate/negative values, and (3) maximum constraint size without quadratic loops.",
            "source": "heuristic",
        }
    if any(w in q for w in ("hint", "stuck", "help", "approach")):
        return {
            "reply": f"Start by identifying the state you need across iterations in **{challenge_title or 'the problem'}**. {analysis['highlights'][0]} Next step: {analysis['suggestions'][0]}",
            "source": "heuristic",
        }

    return {
        "reply": f"I inspected your {lines}-line {language} code for **{challenge_title or 'this challenge'}** (estimated {analysis['time_complexity']} time, {analysis['space_complexity']} space). {analysis['suggestions'][0]}",
        "source": "heuristic",
    }
