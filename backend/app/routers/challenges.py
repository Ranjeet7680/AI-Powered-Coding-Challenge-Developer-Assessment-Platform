import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Challenge
from ..schemas import ChallengeCreate, ChallengeResponse
from .auth import get_current_user

router = APIRouter(prefix="/api/challenges", tags=["Challenges"])

SEED_CHALLENGES = [
    {
        "id": "c1-two-sum",
        "title": "Two Sum Optimal",
        "slug": "two-sum-optimal",
        "description": """### Problem Statement
Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

You can return the answer in any order.

### Example 1:
```
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
```

### Constraints:
- `2 <= nums.length <= 10^4`
- `-10^9 <= nums[i] <= 10^9`
- `-10^9 <= target <= 10^9`
- **Only one valid answer exists.**
""",
        "difficulty": "Easy",
        "category": "Arrays & Hashing",
        "problem_type": "Algorithm",
        "time_limit_ms": 1500,
        "memory_limit_mb": 128,
        "constraints": ["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9", "O(N) Time complexity required"],
        "input_format": "First line target, second line space-separated integers nums.",
        "output_format": "Space-separated zero-based indices.",
        "examples": [
            {"input": "9\\n2 7 11 15", "output": "0 1", "explanation": "2 + 7 = 9"},
            {"input": "6\\n3 2 4", "output": "1 2", "explanation": "2 + 4 = 6"}
        ],
        "starter_code": {
            "python": """import sys

def two_sum(nums, target):
    # Time Complexity: O(N), Space Complexity: O(N)
    lookup = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in lookup:
            return [lookup[complement], i]
        lookup[num] = i
    return []

if __name__ == '__main__':
    raw = sys.stdin.read().split()
    if len(raw) >= 2:
        target = int(raw[0])
        nums = [int(x) for x in raw[1:]]
        ans = two_sum(nums, target)
        print(f"{ans[0]} {ans[1]}")
    else:
        print("0 1")
""",
            "javascript": """const fs = require('fs');

function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}

const input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
if (input.length >= 2) {
  const target = parseInt(input[0], 10);
  const nums = input.slice(1).map(Number);
  const res = twoSum(nums, target);
  console.log(`${res[0]} ${res[1]}`);
}
""",
            "cpp": """#include <iostream>
#include <vector>
#include <unordered_map>
using namespace std;

int main() {
    int target;
    if (!(cin >> target)) return 0;
    vector<int> nums;
    int val;
    while (cin >> val) nums.push_back(val);
    
    unordered_map<int, int> seen;
    for (int i = 0; i < (int)nums.size(); ++i) {
        int comp = target - nums[i];
        if (seen.count(comp)) {
            cout << seen[comp] << " " << i << "\\n";
            return 0;
        }
        seen[nums[i]] = i;
    }
    return 0;
}
"""
        },
        "test_cases": [
            {"input": "9\\n2 7 11 15", "expected_output": "0 1", "is_hidden": False},
            {"input": "6\\n3 2 4", "expected_output": "1 2", "is_hidden": False},
            {"input": "6\\n3 3", "expected_output": "0 1", "is_hidden": False},
            {"input": "100\\n10 20 30 40 50 60 70", "expected_output": "3 5", "is_hidden": True},
            {"input": "-10\\n-3 -7 5 10", "expected_output": "0 1", "is_hidden": True}
        ],
        "hints": ["Can you solve it in a single pass using a hash map?", "For each number, check if target - number is already in your lookup map."],
        "expected_complexity": {"time": "O(N)", "space": "O(N)"},
        "is_ai_generated": False,
        "tags": ["arrays", "hash-table", "easy"],
        "acceptance_rate": 84.2,
        "total_submissions": 3410
    },
    {
        "id": "c2-lru-cache",
        "title": "LRU Cache Design",
        "slug": "lru-cache-design",
        "description": """### Problem Statement
Design a data structure that follows the constraints of a **Least Recently Used (LRU) cache**.

Implement the `LRUCache` class:
- `LRUCache(int capacity)`: Initialize the LRU cache with positive size `capacity`.
- `int get(int key)`: Return the value of the `key` if the key exists, otherwise return `-1`.
- `void put(int key, int value)`: Update the value of the `key` if the `key` exists. Otherwise, add the `key-value` pair to the cache. If the number of keys exceeds the `capacity` from this operation, **evict the least recently used key**.

The functions `get` and `put` must each run in **O(1)** average time complexity.
""",
        "difficulty": "Medium",
        "category": "Design & Systems",
        "problem_type": "Data Structure",
        "time_limit_ms": 2000,
        "memory_limit_mb": 256,
        "constraints": ["1 <= capacity <= 3000", "0 <= key <= 10^4", "0 <= value <= 10^5", "At most 2 * 10^5 calls to get and put"],
        "input_format": "Commands array and parameters stream.",
        "output_format": "Values produced by get operations.",
        "examples": [
            {"input": "2\\nput 1 1\\nput 2 2\\nget 1\\nput 3 3\\nget 2\\nput 4 4\\nget 1\\nget 3\\nget 4", "output": "1 -1 -1 3 4", "explanation": "Cache capacity 2. Key 2 gets evicted when key 3 is added."}
        ],
        "starter_code": {
            "python": """import sys
from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.cache = OrderedDict()

    def get(self, key: int) -> int:
        if key not in self.cache:
            return -1
        self.cache.move_to_end(key)
        return self.cache[key]

    def put(self, key: int, value: int) -> None:
        if key in self.cache:
            self.cache.move_to_end(key)
        self.cache[key] = value
        if len(self.cache) > self.capacity:
            self.cache.popitem(last=False)

if __name__ == '__main__':
    lines = sys.stdin.read().splitlines()
    if not lines:
        sys.exit(0)
    cap = int(lines[0].strip())
    lru = LRUCache(cap)
    outputs = []
    for line in lines[1:]:
        parts = line.strip().split()
        if not parts:
            continue
        cmd = parts[0]
        if cmd == "put":
            lru.put(int(parts[1]), int(parts[2]))
        elif cmd == "get":
            outputs.append(str(lru.get(int(parts[1]))))
    print(" ".join(outputs))
""",
            "javascript": """const fs = require('fs');

class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  get(key) {
    if (!this.cache.has(key)) return -1;
    const val = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, val);
    return val;
  }

  put(key, value) {
    if (this.cache.has(key)) this.cache.delete(key);
    this.cache.set(key, value);
    if (this.cache.size > this.capacity) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }
}

const input = fs.readFileSync(0, 'utf-8').trim().split('\\n');
if (input.length > 0) {
  const cap = parseInt(input[0], 10);
  const lru = new LRUCache(cap);
  const results = [];
  for (let i = 1; i < input.length; i++) {
    const parts = input[i].trim().split(/\\s+/);
    if (parts[0] === 'put') lru.put(parseInt(parts[1]), parseInt(parts[2]));
    if (parts[0] === 'get') results.push(lru.get(parseInt(parts[1])));
  }
  console.log(results.join(' '));
}
"""
        },
        "test_cases": [
            {"input": "2\\nput 1 1\\nput 2 2\\nget 1\\nput 3 3\\nget 2\\nput 4 4\\nget 1\\nget 3\\nget 4", "expected_output": "1 -1 -1 3 4", "is_hidden": False},
            {"input": "1\\nput 1 10\\nget 1\\nput 2 20\\nget 1\\nget 2", "expected_output": "10 -1 20", "is_hidden": False},
            {"input": "3\\nput 1 1\\nput 2 2\\nput 3 3\\nget 1\\nput 4 4\\nget 2", "expected_output": "1 -1", "is_hidden": True}
        ],
        "hints": ["Use a doubly linked list combined with a hash table to achieve O(1) operations.", "Remember that accessing a key marks it as most recently used."],
        "expected_complexity": {"time": "O(1)", "space": "O(capacity)"},
        "is_ai_generated": False,
        "tags": ["design", "hash-table", "linked-list", "medium"],
        "acceptance_rate": 62.1,
        "total_submissions": 2180
    },
    {
        "id": "c3-trapping-rain-water",
        "title": "Trapping Rain Water",
        "slug": "trapping-rain-water",
        "difficulty": "Hard",
        "category": "Two Pointers",
        "problem_type": "Algorithm",
        "time_limit_ms": 2000,
        "memory_limit_mb": 256,
        "description": """### Problem Statement
Given `n` non-negative integers representing an elevation map where the width of each bar is `1`, compute how much water it can trap after raining.

### Example 1:
```
Input: height = [0,1,0,2,1,0,1,3,2,1,2,1]
Output: 6
Explanation: The elevation map traps 6 units of rain water.
```

### Constraints:
- `n == height.length`
- `1 <= n <= 2 * 10^4`
- `0 <= height[i] <= 10^5`
""",
        "constraints": ["1 <= n <= 2 * 10^4", "0 <= height[i] <= 10^5", "Optimal Space: O(1)"],
        "input_format": "Space-separated elevation heights.",
        "output_format": "Single integer units of trapped water.",
        "examples": [
            {"input": "0 1 0 2 1 0 1 3 2 1 2 1", "output": "6", "explanation": "Traps 6 units."}
        ],
        "starter_code": {
            "python": """import sys

def trap(height):
    if not height:
        return 0
    left, right = 0, len(height) - 1
    left_max, right_max = 0, 0
    water = 0
    while left < right:
        if height[left] < height[right]:
            if height[left] >= left_max:
                left_max = height[left]
            else:
                water += left_max - height[left]
            left += 1
        else:
            if height[right] >= right_max:
                right_max = height[right]
            else:
                water += right_max - height[right]
            right -= 1
    return water

if __name__ == '__main__':
    nums = [int(x) for x in sys.stdin.read().split()]
    print(trap(nums))
"""
        },
        "test_cases": [
            {"input": "0 1 0 2 1 0 1 3 2 1 2 1", "expected_output": "6", "is_hidden": False},
            {"input": "4 2 0 3 2 5", "expected_output": "9", "is_hidden": False},
            {"input": "1 2 3 4 5", "expected_output": "0", "is_hidden": True}
        ],
        "hints": ["Can two pointers moving inwards maintain maximum heights seen so far?"],
        "expected_complexity": {"time": "O(N)", "space": "O(1)"},
        "is_ai_generated": False,
        "tags": ["two-pointers", "dynamic-programming", "hard"],
        "acceptance_rate": 59.4,
        "total_submissions": 1840
    },
    {
        "id": "c4-number-of-islands",
        "title": "Number of Islands",
        "slug": "number-of-islands",
        "difficulty": "Medium",
        "category": "Graphs & BFS/DFS",
        "problem_type": "Algorithm",
        "time_limit_ms": 2000,
        "memory_limit_mb": 256,
        "description": """### Problem Statement
Given an `m x n` 2D binary grid `grid` which represents a map of `'1'`s (land) and `'0'`s (water), return the number of islands.

An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. You may assume all four edges of the grid are all surrounded by water.
""",
        "constraints": ["m == grid.length", "n == grid[i].length", "1 <= m, n <= 300"],
        "input_format": "First line rows m and cols n. Next m lines contain space-separated 0s and 1s.",
        "output_format": "Single integer denoting island count.",
        "examples": [
            {"input": "4 5\\n1 1 1 1 0\\n1 1 0 1 0\\n1 1 0 0 0\\n0 0 0 0 0", "output": "1", "explanation": "All 1s connect into a single island."}
        ],
        "starter_code": {
            "python": """import sys

def num_islands(grid):
    if not grid or not grid[0]:
        return 0
    m, n = len(grid), len(grid[0])
    count = 0
    
    def dfs(r, c):
        if r < 0 or r >= m or c < 0 or c >= n or grid[r][c] != '1':
            return
        grid[r][c] = '0'
        dfs(r+1, c)
        dfs(r-1, c)
        dfs(r, c+1)
        dfs(r, c-1)

    for r in range(m):
        for c in range(n):
            if grid[r][c] == '1':
                count += 1
                dfs(r, c)
    return count

if __name__ == '__main__':
    tokens = sys.stdin.read().split()
    if len(tokens) >= 2:
        m, n = int(tokens[0]), int(tokens[1])
        vals = tokens[2:2 + m*n]
        grid = [vals[i*n:(i+1)*n] for i in range(m)]
        print(num_islands(grid))
    else:
        print(0)
"""
        },
        "test_cases": [
            {"input": "4 5\\n1 1 1 1 0\\n1 1 0 1 0\\n1 1 0 0 0\\n0 0 0 0 0", "expected_output": "1", "is_hidden": False},
            {"input": "4 5\\n1 1 0 0 0\\n1 1 0 0 0\\n0 0 1 0 0\\n0 0 0 1 1", "expected_output": "3", "is_hidden": False}
        ],
        "hints": ["Traverse each cell and launch a DFS/BFS sink to mark connected land."],
        "expected_complexity": {"time": "O(M * N)", "space": "O(M * N)"},
        "is_ai_generated": False,
        "tags": ["graphs", "dfs", "bfs", "medium"],
        "acceptance_rate": 67.8,
        "total_submissions": 2980
    },
    {
        "id": "c-ml-linear-regression",
        "title": "Linear Regression with Gradient Descent",
        "slug": "linear-regression-gradient-descent",
        "difficulty": "Easy",
        "category": "Machine Learning",
        "problem_type": "Supervised Learning",
        "time_limit_ms": 2000,
        "memory_limit_mb": 256,
        "description": """### Problem Statement
Implement a 1D **Linear Regression** model using **Batch Gradient Descent** from scratch.

Given training feature points `X`, target labels `Y`, learning rate `alpha`, and iteration steps `epochs`, train the model:
$$\hat{y} = w \cdot x + b$$

The Mean Squared Error (MSE) objective function is:
$$J(w, b) = \frac{1}{2N} \sum_{i=1}^N (\hat{y}_i - y_i)^2$$

Compute gradients and update weights:
$$w := w - \alpha \frac{\partial J}{\partial w}, \quad b := b - \alpha \frac{\partial J}{\partial b}$$

Start with initial parameters $w = 0.0$ and $b = 0.0$.
After `epochs` updates, output the final weight `w` and bias `b` rounded to 2 decimal places.
""",
        "constraints": ["1 <= N <= 10^4", "1 <= epochs <= 1000", "0.0001 <= alpha <= 0.1"],
        "input_format": "First line: N alpha epochs. Next N lines each contain x and y.",
        "output_format": "Space-separated final w and b rounded to 2 decimal places.",
        "examples": [
            {"input": "3 0.01 100\\n1.0 2.0\\n2.0 4.0\\n3.0 6.0", "output": "1.71 0.65", "explanation": "Batch gradient descent update after 100 epochs."}
        ],
        "starter_code": {
            "python": """import sys

def train_linear_regression(X, Y, alpha, epochs):
    n = len(X)
    w = 0.0
    b = 0.0
    
    for _ in range(epochs):
        dw = 0.0
        db = 0.0
        for i in range(n):
            y_hat = w * X[i] + b
            err = y_hat - Y[i]
            dw += err * X[i]
            db += err
        w -= alpha * (dw / n)
        b -= alpha * (db / n)
    return round(w, 2), round(b, 2)

if __name__ == '__main__':
    raw = sys.stdin.read().split()
    if len(raw) >= 3:
        n = int(raw[0])
        alpha = float(raw[1])
        epochs = int(raw[2])
        X = []
        Y = []
        idx = 3
        for _ in range(n):
            if idx + 1 < len(raw):
                X.append(float(raw[idx]))
                Y.append(float(raw[idx+1]))
                idx += 2
        w, b = train_linear_regression(X, Y, alpha, epochs)
        print(f"{w:.2f} {b:.2f}")
    else:
        print("0.00 0.00")
""",
            "javascript": """const fs = require('fs');

function solve() {
  const tokens = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
  if (tokens.length < 3) return;
  const n = parseInt(tokens[0], 10);
  const alpha = parseFloat(tokens[1]);
  const epochs = parseInt(tokens[2], 10);
  const X = [];
  const Y = [];
  let idx = 3;
  for (let i = 0; i < n; i++) {
    X.push(parseFloat(tokens[idx++]));
    Y.push(parseFloat(tokens[idx++]));
  }
  let w = 0.0, b = 0.0;
  for (let ep = 0; ep < epochs; ep++) {
    let dw = 0.0, db = 0.0;
    for (let i = 0; i < n; i++) {
      const err = (w * X[i] + b) - Y[i];
      dw += err * X[i];
      db += err;
    }
    w -= alpha * (dw / n);
    b -= alpha * (db / n);
  }
  console.log(`${w.toFixed(2)} ${b.toFixed(2)}`);
}
solve();
"""
        },
        "test_cases": [
            {"input": "3 0.01 100\\n1.0 2.0\\n2.0 4.0\\n3.0 6.0", "expected_output": "1.71 0.65", "is_hidden": False},
            {"input": "4 0.05 50\\n1.0 3.0\\n2.0 5.0\\n3.0 7.0\\n4.0 9.0", "expected_output": "2.07 0.80", "is_hidden": False},
            {"input": "2 0.01 10\\n1.0 1.0\\n2.0 2.0", "expected_output": "0.22 0.13", "is_hidden": True}
        ],
        "hints": ["Gradient for w is 1/N * sum((y_hat - y) * x).", "Be careful to divide the accumulated gradient by N before updating w and b."],
        "expected_complexity": {"time": "O(epochs * N)", "space": "O(1)"},
        "is_ai_generated": False,
        "tags": ["machine-learning", "linear-regression", "gradient-descent", "python"],
        "acceptance_rate": 78.4,
        "total_submissions": 1540
    },
    {
        "id": "c-ml-softmax-loss",
        "title": "Numerically Stable Softmax & Cross-Entropy",
        "slug": "softmax-cross-entropy-loss",
        "difficulty": "Medium",
        "category": "Machine Learning",
        "problem_type": "Deep Learning",
        "time_limit_ms": 2000,
        "memory_limit_mb": 256,
        "description": """### Problem Statement
In deep neural networks, computing softmax probabilities naively can cause floating-point arithmetic overflow when logit values $z_i$ are large (e.g. $e^{1000} \to \infty$).

Implement **numerically stable Softmax** and compute **Categorical Cross-Entropy Loss**:
$$p_i = \frac{e^{z_i - \max(z)}}{\sum_j e^{z_j - \max(z)}}$$

The cross-entropy loss for true target class index $k$ (where one-hot $y_k = 1$) is:
$$\mathcal{L} = -\log(p_k)$$

Output the predicted probability distribution array and the computed loss rounded to 4 decimal places.
""",
        "constraints": ["2 <= K <= 100", "-10^4 <= z_i <= 10^4", "0 <= true_class < K"],
        "input_format": "First line: K and true_class. Second line: K space-separated float logits.",
        "output_format": "First line: space-separated probabilities rounded to 4 decimals. Second line: loss rounded to 4 decimals.",
        "examples": [
            {"input": "3 0\\n2.0 1.0 0.1", "output": "0.6590 0.2424 0.0986\\n0.4170", "explanation": "Target class 0 with logit 2.0."}
        ],
        "starter_code": {
            "python": """import sys
import math

def stable_softmax_and_loss(logits, target_idx):
    max_z = max(logits)
    exp_shifted = [math.exp(z - max_z) for z in logits]
    sum_exp = sum(exp_shifted)
    probs = [round(e / sum_exp, 4) for e in exp_shifted]
    loss = -math.log(max(1e-15, exp_shifted[target_idx] / sum_exp))
    return probs, round(loss, 4)

if __name__ == '__main__':
    raw = sys.stdin.read().split()
    if len(raw) >= 2:
        k = int(raw[0])
        target_idx = int(raw[1])
        logits = [float(x) for x in raw[2:2+k]]
        probs, loss = stable_softmax_and_loss(logits, target_idx)
        print(" ".join(f"{p:.4f}" for p in probs))
        print(f"{loss:.4f}")
"""
        },
        "test_cases": [
            {"input": "3 0\\n2.0 1.0 0.1", "expected_output": "0.6590 0.2424 0.0986\\n0.4170", "is_hidden": False},
            {"input": "2 1\\n1000.0 1000.0", "expected_output": "0.5000 0.5000\\n0.6931", "is_hidden": False},
            {"input": "3 2\\n10.0 5.0 10.0", "expected_output": "0.4983 0.0034 0.4983\\n0.6965", "is_hidden": True}
        ],
        "hints": ["Subtract max(logits) before taking math.exp to eliminate floating point overflow."],
        "expected_complexity": {"time": "O(K)", "space": "O(K)"},
        "is_ai_generated": False,
        "tags": ["machine-learning", "deep-learning", "neural-networks", "softmax"],
        "acceptance_rate": 72.1,
        "total_submissions": 1820
    },
    {
        "id": "c-ml-self-attention",
        "title": "Transformer Scaled Dot-Product Attention",
        "slug": "transformer-scaled-dot-product-attention",
        "difficulty": "Hard",
        "category": "Machine Learning",
        "problem_type": "Deep Learning",
        "time_limit_ms": 2000,
        "memory_limit_mb": 256,
        "description": """### Problem Statement
Implement the core mathematical formula powering modern Large Language Models: **Scaled Dot-Product Attention**.

Given Query matrix $Q \in \mathbb{R}^{S \times d_k}$, Key matrix $K \in \mathbb{R}^{S \times d_k}$, and Value matrix $V \in \mathbb{R}^{S \times d_k}$:
$$\text{Attention}(Q, K, V) = \text{Softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)V$$

Where:
1. Matrix multiply $Q$ and $K^T$.
2. Scale each element by $1 / \sqrt{d_k}$.
3. Apply row-wise numerically stable Softmax to yield attention weights $A$.
4. Multiply attention weights $A$ with $V$ to output the context matrix.
""",
        "constraints": ["1 <= S <= 100 (Sequence length)", "1 <= d_k <= 64 (Dimension)"],
        "input_format": "First line: S d_k. Next S lines: Q. Next S lines: K. Next S lines: V.",
        "output_format": "S lines representing the attention output matrix rounded to 2 decimals.",
        "examples": [
            {"input": "2 2\\n1.0 0.0\\n0.0 1.0\\n1.0 0.0\\n0.0 1.0\\n10.0 20.0\\n30.0 40.0", "output": "16.60 26.60\\n23.40 33.40", "explanation": "Attention matrix computed and multiplied with V."}
        ],
        "starter_code": {
            "python": """import sys
import math

def attention(Q, K, V, S, d_k):
    # 1. Q * K^T
    scale = math.sqrt(d_k)
    weights = []
    for i in range(S):
        row = []
        for j in range(S):
            dot = sum(Q[i][c] * K[j][c] for c in range(d_k))
            row.append(dot / scale)
        # Softmax over row
        max_val = max(row)
        exps = [math.exp(x - max_val) for x in row]
        sum_e = sum(exps)
        weights.append([e / sum_e for e in exps])
    
    # 2. weights * V
    out = []
    for i in range(S):
        out_row = []
        for c in range(d_k):
            val = sum(weights[i][j] * V[j][c] for j in range(S))
            out_row.append(round(val, 2))
        out.append(out_row)
    return out

if __name__ == '__main__':
    raw = sys.stdin.read().split()
    if len(raw) >= 2:
        S = int(raw[0])
        d_k = int(raw[1])
        idx = 2
        def read_matrix():
            nonlocal idx
            mat = []
            for _ in range(S):
                mat.append([float(raw[idx + c]) for c in range(d_k)])
                idx += d_k
            return mat
        Q = read_matrix()
        K = read_matrix()
        V = read_matrix()
        res = attention(Q, K, V, S, d_k)
        for row in res:
            print(" ".join(f"{x:.2f}" for x in row))
"""
        },
        "test_cases": [
            {"input": "2 2\\n1.0 0.0\\n0.0 1.0\\n1.0 0.0\\n0.0 1.0\\n10.0 20.0\\n30.0 40.0", "expected_output": "16.60 26.60\\n23.40 33.40", "is_hidden": False},
            {"input": "1 2\\n1.0 1.0\\n1.0 1.0\\n5.0 5.0", "expected_output": "5.00 5.00", "is_hidden": False}
        ],
        "hints": ["Remember to transpose K when computing QK^T.", "Softmax must be calculated across each row independently."],
        "expected_complexity": {"time": "O(S^2 * d_k)", "space": "O(S^2)"},
        "is_ai_generated": False,
        "tags": ["machine-learning", "transformers", "attention", "deep-learning", "llm"],
        "acceptance_rate": 61.4,
        "total_submissions": 980
    }
]

def seed_initial_challenges(db: Session):
    for c_data in SEED_CHALLENGES:
        existing = db.query(Challenge).filter(Challenge.id == c_data["id"]).first()
        if not existing:
            c = Challenge(
                id=c_data["id"],
                title=c_data["title"],
                slug=c_data["slug"],
                description=c_data["description"],
                difficulty=c_data["difficulty"],
                category=c_data["category"],
                problem_type=c_data["problem_type"],
                time_limit_ms=c_data["time_limit_ms"],
                memory_limit_mb=c_data["memory_limit_mb"],
                constraints=c_data["constraints"],
                input_format=c_data.get("input_format", ""),
                output_format=c_data.get("output_format", ""),
                examples=c_data["examples"],
                starter_code=c_data["starter_code"],
                test_cases=c_data["test_cases"],
                hints=c_data["hints"],
                expected_complexity=c_data["expected_complexity"],
                is_ai_generated=c_data["is_ai_generated"],
                tags=c_data["tags"],
                acceptance_rate=c_data["acceptance_rate"],
                total_submissions=c_data["total_submissions"]
            )
            db.add(c)
        else:
            existing.test_cases = c_data["test_cases"]
            existing.examples = c_data["examples"]
            existing.starter_code = c_data["starter_code"]
            existing.description = c_data["description"]
    db.commit()

@router.get("", response_model=List[ChallengeResponse])
def get_challenges(
    search: Optional[str] = None,
    difficulty: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Challenge)
    if search:
        query = query.filter(Challenge.title.ilike(f"%{search}%") | Challenge.description.ilike(f"%{search}%"))
    if difficulty and difficulty != "All":
        query = query.filter(Challenge.difficulty == difficulty)
    if category and category != "All":
        query = query.filter(Challenge.category == category)
    
    challenges = query.order_by(Challenge.created_at.desc()).all()
    if not challenges:
        seed_initial_challenges(db)
        challenges = query.all()
    return challenges

@router.get("/{challenge_id}", response_model=ChallengeResponse)
def get_challenge(challenge_id: str, db: Session = Depends(get_db)):
    challenge = db.query(Challenge).filter((Challenge.id == challenge_id) | (Challenge.slug == challenge_id)).first()
    if not challenge:
        # Check seed data
        seed_initial_challenges(db)
        challenge = db.query(Challenge).filter((Challenge.id == challenge_id) | (Challenge.slug == challenge_id)).first()
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")
    return challenge

@router.post("", response_model=ChallengeResponse)
def create_challenge(payload: ChallengeCreate, db: Session = Depends(get_db)):
    slug = payload.title.lower().replace(" ", "-").replace("/", "-")
    existing = db.query(Challenge).filter(Challenge.slug == slug).first()
    if existing:
        slug = f"{slug}-{uuid.uuid4().hex[:6]}"

    challenge = Challenge(
        id=str(uuid.uuid4()),
        title=payload.title,
        slug=slug,
        description=payload.description,
        difficulty=payload.difficulty,
        category=payload.category,
        problem_type=payload.problem_type or "Algorithm",
        time_limit_ms=payload.time_limit_ms or 2000,
        memory_limit_mb=payload.memory_limit_mb or 256,
        constraints=payload.constraints,
        input_format=payload.input_format,
        output_format=payload.output_format,
        examples=[e.dict() for e in payload.examples],
        starter_code=payload.starter_code,
        test_cases=[tc.dict() for tc in payload.test_cases],
        hints=payload.hints,
        expected_complexity=payload.expected_complexity.dict() if payload.expected_complexity else {"time": "O(N)", "space": "O(1)"},
        tags=payload.tags,
        is_ai_generated=payload.is_ai_generated
    )
    db.add(challenge)
    db.commit()
    db.refresh(challenge)
    return challenge
