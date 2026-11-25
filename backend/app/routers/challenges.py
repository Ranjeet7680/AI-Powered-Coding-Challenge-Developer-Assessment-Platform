import uuid
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Challenge
from ..schemas import ChallengeCreate, ChallengeResponse
from ..services.challenge_bank import generate_all_bank_challenges

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
```""",
        "difficulty": "Easy",
        "category": "Arrays & Hashing",
        "problem_type": "Algorithm",
        "time_limit_ms": 1500,
        "memory_limit_mb": 128,
        "constraints": ["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9", "O(N) Time complexity required"],
        "input_format": "First line target, second line space-separated integers nums.",
        "output_format": "Space-separated zero-based indices.",
        "examples": [
            {"input": "9\n2 7 11 15", "output": "0 1", "explanation": "2 + 7 = 9"},
            {"input": "6\n3 2 4", "output": "1 2", "explanation": "2 + 4 = 6"},
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
            "typescript": """import * as fs from 'node:fs';

function twoSum(nums: number[], target: number): [number, number] | [] {
  const map = new Map<number, number>();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement)!, i];
    }
    map.set(nums[i], i);
  }
  return [];
}

const input: string[] = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
if (input.length >= 2) {
  const target = parseInt(input[0], 10);
  const nums = input.slice(1).map(Number);
  const res = twoSum(nums, target);
  if (res.length === 2) console.log(`${res[0]} ${res[1]}`);
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
""",
        },
        "test_cases": [
            {"input": "9\n2 7 11 15", "expected_output": "0 1", "is_hidden": False},
            {"input": "6\n3 2 4", "expected_output": "1 2", "is_hidden": False},
            {"input": "6\n3 3", "expected_output": "0 1", "is_hidden": False},
            {"input": "100\n10 20 30 40 50 60 70", "expected_output": "3 5", "is_hidden": True},
            {"input": "-10\n-3 -7 5 10", "expected_output": "0 1", "is_hidden": True},
        ],
        "hints": [
            "Can you solve it in a single pass using a hash map?",
            "For each number, check if target - number is already in your lookup map.",
        ],
        "expected_complexity": {"time": "O(N)", "space": "O(N)"},
        "is_ai_generated": False,
        "tags": ["arrays", "hash-table", "easy"],
        "acceptance_rate": 84.2,
        "total_submissions": 3410,
    },
    {
        "id": "c2-lru-cache",
        "title": "LRU Cache Design",
        "slug": "lru-cache-design",
        "description": """### Problem Statement
Design a data structure that follows the constraints of a **Least Recently Used (LRU) cache**.

Implement the `LRUCache` class:
- `LRUCache(capacity)`: Initialize the LRU cache with positive size `capacity`.
- `get(key)`: Return the value of the `key` if the key exists, otherwise return `-1`.
- `put(key, value)`: Update the value of the `key` if it exists, or insert the pair. If the cache exceeds `capacity`, **evict the least recently used key**.

Both `get` and `put` must run in **O(1)** average time complexity.""",
        "difficulty": "Medium",
        "category": "Design & Systems",
        "problem_type": "Data Structure",
        "time_limit_ms": 2000,
        "memory_limit_mb": 256,
        "constraints": ["1 <= capacity <= 3000", "0 <= key <= 10^4", "0 <= value <= 10^5", "At most 2 * 10^5 calls"],
        "input_format": "Commands array and parameters stream.",
        "output_format": "Values produced by get operations.",
        "examples": [
            {
                "input": "2\nput 1 1\nput 2 2\nget 1\nput 3 3\nget 2\nput 4 4\nget 1\nget 3\nget 4",
                "output": "1 -1 -1 3 4",
                "explanation": "Cache capacity 2. Key 2 gets evicted when key 3 is added.",
            }
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
        if parts[0] == "put":
            lru.put(int(parts[1]), int(parts[2]))
        elif parts[0] == "get":
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
if (input.length > 0 && input[0]) {
  const cap = parseInt(input[0], 10);
  const lru = new LRUCache(cap);
  const results = [];
  for (let i = 1; i < input.length; i++) {
    const parts = input[i].trim().split(/\\s+/);
    if (parts[0] === 'put') lru.put(parseInt(parts[1], 10), parseInt(parts[2], 10));
    if (parts[0] === 'get') results.push(lru.get(parseInt(parts[1], 10)));
  }
  console.log(results.join(' '));
}
""",
            "typescript": """import * as fs from 'node:fs';

class LRUCache {
  private capacity: number;
  private cache: Map<number, number>;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.cache = new Map<number, number>();
  }

  get(key: number): number {
    if (!this.cache.has(key)) return -1;
    const val = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, val);
    return val;
  }

  put(key: number, value: number): void {
    if (this.cache.has(key)) this.cache.delete(key);
    this.cache.set(key, value);
    if (this.cache.size > this.capacity) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) this.cache.delete(oldestKey);
    }
  }
}

const input: string[] = fs.readFileSync(0, 'utf-8').trim().split('\\n');
if (input.length > 0 && input[0]) {
  const cap = parseInt(input[0], 10);
  const lru = new LRUCache(cap);
  const results: number[] = [];
  for (let i = 1; i < input.length; i++) {
    const parts = input[i].trim().split(/\\s+/);
    if (parts[0] === 'put') lru.put(parseInt(parts[1], 10), parseInt(parts[2], 10));
    if (parts[0] === 'get') results.push(lru.get(parseInt(parts[1], 10)));
  }
  console.log(results.join(' '));
}
""",
            "cpp": """#include <iostream>
#include <list>
#include <unordered_map>
#include <string>
using namespace std;

class LRUCache {
    int cap;
    list<pair<int, int>> order;
    unordered_map<int, list<pair<int, int>>::iterator> lookup;
public:
    LRUCache(int capacity) : cap(capacity) {}

    int get(int key) {
        if (!lookup.count(key)) return -1;
        order.splice(order.begin(), order, lookup[key]);
        return lookup[key]->second;
    }

    void put(int key, int value) {
        if (lookup.count(key)) {
            lookup[key]->second = value;
            order.splice(order.begin(), order, lookup[key]);
            return;
        }
        order.emplace_front(key, value);
        lookup[key] = order.begin();
        if ((int)lookup.size() > cap) {
            lookup.erase(order.back().first);
            order.pop_back();
        }
    }
};

int main() {
    int cap;
    if (!(cin >> cap)) return 0;
    LRUCache lru(cap);
    string cmd;
    bool first = true;
    while (cin >> cmd) {
        if (cmd == "put") {
            int k, v;
            cin >> k >> v;
            lru.put(k, v);
        } else if (cmd == "get") {
            int k;
            cin >> k;
            cout << (first ? "" : " ") << lru.get(k);
            first = false;
        }
    }
    cout << "\\n";
    return 0;
}
""",
        },
        "test_cases": [
            {"input": "2\nput 1 1\nput 2 2\nget 1\nput 3 3\nget 2\nput 4 4\nget 1\nget 3\nget 4", "expected_output": "1 -1 -1 3 4", "is_hidden": False},
            {"input": "1\nput 1 10\nget 1\nput 2 20\nget 1\nget 2", "expected_output": "10 -1 20", "is_hidden": False},
            {"input": "3\nput 1 1\nput 2 2\nput 3 3\nget 1\nput 4 4\nget 2", "expected_output": "1 -1", "is_hidden": True},
        ],
        "hints": [
            "Use a doubly linked list combined with a hash table to achieve O(1) operations.",
            "Remember that accessing a key marks it as most recently used.",
        ],
        "expected_complexity": {"time": "O(1)", "space": "O(capacity)"},
        "is_ai_generated": False,
        "tags": ["design", "hash-table", "linked-list", "medium"],
        "acceptance_rate": 62.1,
        "total_submissions": 2180,
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
```""",
        "constraints": ["1 <= n <= 2 * 10^4", "0 <= height[i] <= 10^5", "Optimal Space: O(1)"],
        "input_format": "Space-separated elevation heights.",
        "output_format": "Single integer units of trapped water.",
        "examples": [
            {"input": "0 1 0 2 1 0 1 3 2 1 2 1", "output": "6", "explanation": "Traps 6 units."},
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
""",
            "javascript": """const fs = require('fs');

function trap(height) {
  let left = 0, right = height.length - 1;
  let leftMax = 0, rightMax = 0, water = 0;
  while (left < right) {
    if (height[left] < height[right]) {
      leftMax = Math.max(leftMax, height[left]);
      water += leftMax - height[left++];
    } else {
      rightMax = Math.max(rightMax, height[right]);
      water += rightMax - height[right--];
    }
  }
  return water;
}

const raw = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/).filter(Boolean).map(Number);
console.log(trap(raw));
""",
            "typescript": """import * as fs from 'node:fs';

function trap(height: number[]): number {
  let left = 0;
  let right = height.length - 1;
  let leftMax = 0;
  let rightMax = 0;
  let water = 0;
  while (left < right) {
    if (height[left] < height[right]) {
      leftMax = Math.max(leftMax, height[left]);
      water += leftMax - height[left++];
    } else {
      rightMax = Math.max(rightMax, height[right]);
      water += rightMax - height[right--];
    }
  }
  return water;
}

const raw: number[] = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/).filter(Boolean).map(Number);
console.log(trap(raw));
""",
            "cpp": """#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    vector<int> h;
    int x;
    while (cin >> x) h.push_back(x);
    int left = 0, right = (int)h.size() - 1;
    int leftMax = 0, rightMax = 0;
    long long water = 0;
    while (left < right) {
        if (h[left] < h[right]) {
            leftMax = max(leftMax, h[left]);
            water += leftMax - h[left++];
        } else {
            rightMax = max(rightMax, h[right]);
            water += rightMax - h[right--];
        }
    }
    cout << water << "\\n";
    return 0;
}
""",
        },
        "test_cases": [
            {"input": "0 1 0 2 1 0 1 3 2 1 2 1", "expected_output": "6", "is_hidden": False},
            {"input": "4 2 0 3 2 5", "expected_output": "9", "is_hidden": False},
            {"input": "1 2 3 4 5", "expected_output": "0", "is_hidden": True},
        ],
        "hints": ["Can two pointers moving inwards maintain maximum heights seen so far?"],
        "expected_complexity": {"time": "O(N)", "space": "O(1)"},
        "is_ai_generated": False,
        "tags": ["two-pointers", "dynamic-programming", "hard"],
        "acceptance_rate": 59.4,
        "total_submissions": 1840,
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

An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.""",
        "constraints": ["m == grid.length", "n == grid[i].length", "1 <= m, n <= 300"],
        "input_format": "First line rows m and cols n. Next m lines contain space-separated 0s and 1s.",
        "output_format": "Single integer denoting island count.",
        "examples": [
            {
                "input": "4 5\n1 1 1 1 0\n1 1 0 1 0\n1 1 0 0 0\n0 0 0 0 0",
                "output": "1",
                "explanation": "All 1s connect into a single island.",
            }
        ],
        "starter_code": {
            "python": """import sys

def num_islands(grid):
    if not grid or not grid[0]:
        return 0
    m, n = len(grid), len(grid[0])
    count = 0

    def dfs(r, c):
        stack = [(r, c)]
        while stack:
            cr, cc = stack.pop()
            if cr < 0 or cr >= m or cc < 0 or cc >= n or grid[cr][cc] != '1':
                continue
            grid[cr][cc] = '0'
            stack.extend([(cr + 1, cc), (cr - 1, cc), (cr, cc + 1), (cr, cc - 1)])

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
        vals = tokens[2:2 + m * n]
        grid = [vals[i * n:(i + 1) * n] for i in range(m)]
        print(num_islands(grid))
    else:
        print(0)
""",
            "javascript": """const fs = require('fs');

function numIslands(grid) {
  if (!grid.length) return 0;
  const m = grid.length, n = grid[0].length;
  let count = 0;
  const sink = (r, c) => {
    const stack = [[r, c]];
    while (stack.length) {
      const [cr, cc] = stack.pop();
      if (cr < 0 || cr >= m || cc < 0 || cc >= n || grid[cr][cc] !== '1') continue;
      grid[cr][cc] = '0';
      stack.push([cr + 1, cc], [cr - 1, cc], [cr, cc + 1], [cr, cc - 1]);
    }
  };
  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      if (grid[r][c] === '1') { count++; sink(r, c); }
    }
  }
  return count;
}

const tokens = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
if (tokens.length >= 2) {
  const m = parseInt(tokens[0], 10), n = parseInt(tokens[1], 10);
  const grid = [];
  for (let i = 0; i < m; i++) grid.push(tokens.slice(2 + i * n, 2 + (i + 1) * n));
  console.log(numIslands(grid));
}
""",
            "typescript": """import * as fs from 'node:fs';

function numIslands(grid: string[][]): number {
  if (!grid.length) return 0;
  const m = grid.length;
  const n = grid[0].length;
  let count = 0;
  const sink = (r: number, c: number) => {
    const stack: [number, number][] = [[r, c]];
    while (stack.length) {
      const [cr, cc] = stack.pop()!;
      if (cr < 0 || cr >= m || cc < 0 || cc >= n || grid[cr][cc] !== '1') continue;
      grid[cr][cc] = '0';
      stack.push([cr + 1, cc], [cr - 1, cc], [cr, cc + 1], [cr, cc - 1]);
    }
  };
  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      if (grid[r][c] === '1') { count++; sink(r, c); }
    }
  }
  return count;
}

const tokens: string[] = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
if (tokens.length >= 2) {
  const m = parseInt(tokens[0], 10), n = parseInt(tokens[1], 10);
  const grid: string[][] = [];
  for (let i = 0; i < m; i++) grid.push(tokens.slice(2 + i * n, 2 + (i + 1) * n));
  console.log(numIslands(grid));
}
""",
            "cpp": """#include <iostream>
#include <vector>
#include <stack>
using namespace std;

int main() {
    int m, n;
    if (!(cin >> m >> n)) return 0;
    vector<vector<int>> g(m, vector<int>(n));
    for (int i = 0; i < m; ++i)
        for (int j = 0; j < n; ++j)
            cin >> g[i][j];
    int count = 0;
    int dr[4] = {1, -1, 0, 0}, dc[4] = {0, 0, 1, -1};
    for (int r = 0; r < m; ++r) {
        for (int c = 0; c < n; ++c) {
            if (g[r][c] == 1) {
                count++;
                stack<pair<int,int>> st;
                st.push({r, c});
                while (!st.empty()) {
                    auto [cr, cc] = st.top(); st.pop();
                    if (cr < 0 || cr >= m || cc < 0 || cc >= n || g[cr][cc] != 1) continue;
                    g[cr][cc] = 0;
                    for (int k = 0; k < 4; ++k) st.push({cr + dr[k], cc + dc[k]});
                }
            }
        }
    }
    cout << count << "\\n";
    return 0;
}
""",
        },
        "test_cases": [
            {"input": "4 5\n1 1 1 1 0\n1 1 0 1 0\n1 1 0 0 0\n0 0 0 0 0", "expected_output": "1", "is_hidden": False},
            {"input": "4 5\n1 1 0 0 0\n1 1 0 0 0\n0 0 1 0 0\n0 0 0 1 1", "expected_output": "3", "is_hidden": False},
        ],
        "hints": ["Traverse each cell and launch a DFS/BFS sink to mark connected land."],
        "expected_complexity": {"time": "O(M * N)", "space": "O(M * N)"},
        "is_ai_generated": False,
        "tags": ["graphs", "dfs", "bfs", "medium"],
        "acceptance_rate": 67.8,
        "total_submissions": 2980,
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
$$\\hat{y} = w \\cdot x + b$$

The Mean Squared Error (MSE) objective function is:
$$J(w, b) = \\frac{1}{2N} \\sum_{i=1}^N (\\hat{y}_i - y_i)^2$$

Compute gradients and update weights:
$$w := w - \\alpha \\frac{\\partial J}{\\partial w}, \\quad b := b - \\alpha \\frac{\\partial J}{\\partial b}$$

Start with initial parameters $w = 0.0$ and $b = 0.0$.
After `epochs` updates, output the final weight `w` and bias `b` rounded to 2 decimal places.""",
        "constraints": ["1 <= N <= 10^4", "1 <= epochs <= 1000", "0.0001 <= alpha <= 0.1"],
        "input_format": "First line: N alpha epochs. Next N lines each contain x and y.",
        "output_format": "Space-separated final w and b rounded to 2 decimal places.",
        "examples": [
            {"input": "3 0.01 100\n1.0 2.0\n2.0 4.0\n3.0 6.0", "output": "1.71 0.65", "explanation": "Batch gradient descent update after 100 epochs."}
        ],
        "starter_code": {
            "python": """import sys

def train_linear_regression(X, Y, alpha, epochs):
    n = len(X)
    w, b = 0.0, 0.0
    for _ in range(epochs):
        dw, db = 0.0, 0.0
        for i in range(n):
            err = (w * X[i] + b) - Y[i]
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
        X = [float(raw[3 + 2 * i]) for i in range(n)]
        Y = [float(raw[4 + 2 * i]) for i in range(n)]
        w, b = train_linear_regression(X, Y, alpha, epochs)
        print(f"{w:.2f} {b:.2f}")
""",
            "javascript": """const fs = require('fs');

function solve() {
  const tokens = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
  if (tokens.length < 3) return;
  const n = parseInt(tokens[0], 10);
  const alpha = parseFloat(tokens[1]);
  const epochs = parseInt(tokens[2], 10);
  const X = [], Y = [];
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
""",
            "typescript": """import * as fs from 'node:fs';

function trainLinearRegression(X: number[], Y: number[], alpha: number, epochs: number): [number, number] {
  const n = X.length;
  let w = 0.0;
  let b = 0.0;
  for (let ep = 0; ep < epochs; ep++) {
    let dw = 0.0;
    let db = 0.0;
    for (let i = 0; i < n; i++) {
      const err = (w * X[i] + b) - Y[i];
      dw += err * X[i];
      db += err;
    }
    w -= alpha * (dw / n);
    b -= alpha * (db / n);
  }
  return [w, b];
}

const tokens: string[] = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
if (tokens.length >= 3) {
  const n = parseInt(tokens[0], 10);
  const alpha = parseFloat(tokens[1]);
  const epochs = parseInt(tokens[2], 10);
  const X: number[] = [];
  const Y: number[] = [];
  let idx = 3;
  for (let i = 0; i < n; i++) {
    X.push(parseFloat(tokens[idx++]));
    Y.push(parseFloat(tokens[idx++]));
  }
  const [w, b] = trainLinearRegression(X, Y, alpha, epochs);
  console.log(`${w.toFixed(2)} ${b.toFixed(2)}`);
}
""",
            "cpp": """#include <iostream>
#include <vector>
#include <iomanip>
using namespace std;

int main() {
    int n, epochs;
    double alpha;
    if (!(cin >> n >> alpha >> epochs)) return 0;
    vector<double> X(n), Y(n);
    for (int i = 0; i < n; ++i) cin >> X[i] >> Y[i];
    double w = 0.0, b = 0.0;
    for (int ep = 0; ep < epochs; ++ep) {
        double dw = 0.0, db = 0.0;
        for (int i = 0; i < n; ++i) {
            double err = (w * X[i] + b) - Y[i];
            dw += err * X[i];
            db += err;
        }
        w -= alpha * (dw / n);
        b -= alpha * (db / n);
    }
    cout << fixed << setprecision(2) << w << " " << b << "\\n";
    return 0;
}
""",
        },
        "test_cases": [
            {"input": "3 0.01 100\n1.0 2.0\n2.0 4.0\n3.0 6.0", "expected_output": "1.71 0.65", "is_hidden": False},
            {"input": "4 0.05 50\n1.0 3.0\n2.0 5.0\n3.0 7.0\n4.0 9.0", "expected_output": "2.07 0.80", "is_hidden": False},
            {"input": "2 0.01 10\n1.0 1.0\n2.0 2.0", "expected_output": "0.22 0.13", "is_hidden": True},
        ],
        "hints": [
            "Gradient for w is 1/N * sum((y_hat - y) * x).",
            "Be careful to divide the accumulated gradient by N before updating w and b.",
        ],
        "expected_complexity": {"time": "O(epochs * N)", "space": "O(1)"},
        "is_ai_generated": False,
        "tags": ["machine-learning", "linear-regression", "gradient-descent", "python"],
        "acceptance_rate": 78.4,
        "total_submissions": 1540,
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
In deep neural networks, computing softmax probabilities naively can cause floating-point arithmetic overflow when logit values $z_i$ are large (e.g. $e^{1000} \\to \\infty$).

Implement **numerically stable Softmax** and compute **Categorical Cross-Entropy Loss**:
$$p_i = \\frac{e^{z_i - \\max(z)}}{\\sum_j e^{z_j - \\max(z)}}$$

The cross-entropy loss for true target class index $k$ (where one-hot $y_k = 1$) is:
$$\\mathcal{L} = -\\log(p_k)$$

Output the predicted probability distribution array and the computed loss rounded to 4 decimal places.""",
        "constraints": ["2 <= K <= 100", "-10^4 <= z_i <= 10^4", "0 <= true_class < K"],
        "input_format": "First line: K and true_class. Second line: K space-separated float logits.",
        "output_format": "First line: space-separated probabilities rounded to 4 decimals. Second line: loss rounded to 4 decimals.",
        "examples": [
            {"input": "3 0\n2.0 1.0 0.1", "output": "0.6590 0.2424 0.0986\n0.4170", "explanation": "Target class 0 with logit 2.0."}
        ],
        "starter_code": {
            "python": """import sys
import math

def stable_softmax_and_loss(logits, target_idx):
    max_z = max(logits)
    exp_shifted = [math.exp(z - max_z) for z in logits]
    sum_exp = sum(exp_shifted)
    probs = [e / sum_exp for e in exp_shifted]
    loss = -math.log(max(1e-15, probs[target_idx]))
    return probs, loss

if __name__ == '__main__':
    raw = sys.stdin.read().split()
    if len(raw) >= 2:
        k = int(raw[0])
        target_idx = int(raw[1])
        logits = [float(x) for x in raw[2:2 + k]]
        probs, loss = stable_softmax_and_loss(logits, target_idx)
        print(" ".join(f"{p:.4f}" for p in probs))
        print(f"{loss:.4f}")
""",
            "javascript": """const fs = require('fs');

const tokens = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
if (tokens.length >= 2) {
  const k = parseInt(tokens[0], 10);
  const target = parseInt(tokens[1], 10);
  const logits = tokens.slice(2, 2 + k).map(Number);
  const maxZ = Math.max(...logits);
  const exps = logits.map((z) => Math.exp(z - maxZ));
  const sumExp = exps.reduce((a, b) => a + b, 0);
  const probs = exps.map((e) => e / sumExp);
  const loss = -Math.log(Math.max(1e-15, probs[target]));
  console.log(probs.map((p) => p.toFixed(4)).join(' '));
  console.log(loss.toFixed(4));
}
""",
            "typescript": """import * as fs from 'node:fs';

const tokens: string[] = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
if (tokens.length >= 2) {
  const k = parseInt(tokens[0], 10);
  const target = parseInt(tokens[1], 10);
  const logits: number[] = tokens.slice(2, 2 + k).map(Number);
  const maxZ = Math.max(...logits);
  const exps = logits.map((z) => Math.exp(z - maxZ));
  const sumExp = exps.reduce((a, b) => a + b, 0);
  const probs = exps.map((e) => e / sumExp);
  const loss = -Math.log(Math.max(1e-15, probs[target]));
  console.log(probs.map((p) => p.toFixed(4)).join(' '));
  console.log(loss.toFixed(4));
}
""",
            "cpp": """#include <iostream>
#include <vector>
#include <cmath>
#include <algorithm>
#include <iomanip>
using namespace std;

int main() {
    int k, target;
    if (!(cin >> k >> target)) return 0;
    vector<double> z(k);
    for (int i = 0; i < k; ++i) cin >> z[i];
    double maxZ = *max_element(z.begin(), z.end());
    vector<double> exps(k);
    double sumExp = 0.0;
    for (int i = 0; i < k; ++i) {
        exps[i] = exp(z[i] - maxZ);
        sumExp += exps[i];
    }
    cout << fixed << setprecision(4);
    for (int i = 0; i < k; ++i) {
        cout << (i ? " " : "") << (exps[i] / sumExp);
    }
    cout << "\\n" << -log(max(1e-15, exps[target] / sumExp)) << "\\n";
    return 0;
}
""",
        },
        "test_cases": [
            {"input": "3 0\n2.0 1.0 0.1", "expected_output": "0.6590 0.2424 0.0986\n0.4170", "is_hidden": False},
            {"input": "2 1\n1000.0 1000.0", "expected_output": "0.5000 0.5000\n0.6931", "is_hidden": False},
            {"input": "3 2\n10.0 5.0 10.0", "expected_output": "0.4983 0.0034 0.4983\n0.6965", "is_hidden": True},
        ],
        "hints": ["Subtract max(logits) before taking math.exp to eliminate floating point overflow."],
        "expected_complexity": {"time": "O(K)", "space": "O(K)"},
        "is_ai_generated": False,
        "tags": ["machine-learning", "deep-learning", "neural-networks", "softmax"],
        "acceptance_rate": 72.1,
        "total_submissions": 1820,
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

Given Query matrix $Q \\in \\mathbb{R}^{S \\times d_k}$, Key matrix $K \\in \\mathbb{R}^{S \\times d_k}$, and Value matrix $V \\in \\mathbb{R}^{S \\times d_k}$:
$$\\text{Attention}(Q, K, V) = \\text{Softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V$$

Where:
1. Matrix multiply $Q$ and $K^T$.
2. Scale each element by $1 / \\sqrt{d_k}$.
3. Apply row-wise numerically stable Softmax to yield attention weights $A$.
4. Multiply attention weights $A$ with $V$ to output the context matrix.""",
        "constraints": ["1 <= S <= 100 (Sequence length)", "1 <= d_k <= 64 (Dimension)"],
        "input_format": "First line: S d_k. Next S lines: Q. Next S lines: K. Next S lines: V.",
        "output_format": "S lines representing the attention output matrix rounded to 2 decimals.",
        "examples": [
            {
                "input": "2 2\n1.0 0.0\n0.0 1.0\n1.0 0.0\n0.0 1.0\n10.0 20.0\n30.0 40.0",
                "output": "16.60 26.60\n23.40 33.40",
                "explanation": "Attention matrix computed and multiplied with V.",
            }
        ],
        "starter_code": {
            "python": """import sys
import math

def attention(Q, K, V, S, d_k):
    scale = math.sqrt(d_k)
    weights = []
    for i in range(S):
        row = []
        for j in range(S):
            dot = sum(Q[i][c] * K[j][c] for c in range(d_k))
            row.append(dot / scale)
        max_val = max(row)
        exps = [math.exp(x - max_val) for x in row]
        sum_e = sum(exps)
        weights.append([e / sum_e for e in exps])

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
        S, d_k = int(raw[0]), int(raw[1])
        idx = 2
        def read_matrix():
            nonlocal idx
            mat = []
            for _ in range(S):
                mat.append([float(raw[idx + c]) for c in range(d_k)])
                idx += d_k
            return mat
        Q, K, V = read_matrix(), read_matrix(), read_matrix()
        for row in attention(Q, K, V, S, d_k):
            print(" ".join(f"{x:.2f}" for x in row))
""",
            "javascript": """const fs = require('fs');

const tokens = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
if (tokens.length >= 2) {
  const S = parseInt(tokens[0], 10);
  const dk = parseInt(tokens[1], 10);
  let idx = 2;
  const readMat = () => {
    const m = [];
    for (let r = 0; r < S; r++) {
      const row = [];
      for (let c = 0; c < dk; c++) row.push(parseFloat(tokens[idx++]));
      m.push(row);
    }
    return m;
  };
  const Q = readMat(), K = readMat(), V = readMat();
  const scale = Math.sqrt(dk);
  for (let i = 0; i < S; i++) {
    const scores = [];
    for (let j = 0; j < S; j++) {
      let dot = 0;
      for (let c = 0; c < dk; c++) dot += Q[i][c] * K[j][c];
      scores.push(dot / scale);
    }
    const maxS = Math.max(...scores);
    const exps = scores.map((x) => Math.exp(x - maxS));
    const sumE = exps.reduce((a, b) => a + b, 0);
    const w = exps.map((e) => e / sumE);
    const outRow = [];
    for (let c = 0; c < dk; c++) {
      let val = 0;
      for (let j = 0; j < S; j++) val += w[j] * V[j][c];
      outRow.push(val.toFixed(2));
    }
    console.log(outRow.join(' '));
  }
}
""",
            "typescript": """import * as fs from 'node:fs';

const tokens: string[] = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
if (tokens.length >= 2) {
  const S = parseInt(tokens[0], 10);
  const dk = parseInt(tokens[1], 10);
  let idx = 2;
  const readMat = (): number[][] => {
    const m: number[][] = [];
    for (let r = 0; r < S; r++) {
      const row: number[] = [];
      for (let c = 0; c < dk; c++) row.push(parseFloat(tokens[idx++]));
      m.push(row);
    }
    return m;
  };
  const Q = readMat(), K = readMat(), V = readMat();
  const scale = Math.sqrt(dk);
  for (let i = 0; i < S; i++) {
    const scores: number[] = [];
    for (let j = 0; j < S; j++) {
      let dot = 0;
      for (let c = 0; c < dk; c++) dot += Q[i][c] * K[j][c];
      scores.push(dot / scale);
    }
    const maxS = Math.max(...scores);
    const exps = scores.map((x) => Math.exp(x - maxS));
    const sumE = exps.reduce((a, b) => a + b, 0);
    const w = exps.map((e) => e / sumE);
    const outRow: string[] = [];
    for (let c = 0; c < dk; c++) {
      let val = 0;
      for (let j = 0; j < S; j++) val += w[j] * V[j][c];
      outRow.push(val.toFixed(2));
    }
    console.log(outRow.join(' '));
  }
}
""",
            "cpp": """#include <iostream>
#include <vector>
#include <cmath>
#include <algorithm>
#include <iomanip>
using namespace std;

int main() {
    int S, dk;
    if (!(cin >> S >> dk)) return 0;
    auto readMat = [&]() {
        vector<vector<double>> m(S, vector<double>(dk));
        for (int i = 0; i < S; ++i)
            for (int j = 0; j < dk; ++j)
                cin >> m[i][j];
        return m;
    };
    auto Q = readMat(), K = readMat(), V = readMat();
    double scale = sqrt((double)dk);
    cout << fixed << setprecision(2);
    for (int i = 0; i < S; ++i) {
        vector<double> scores(S);
        double maxS = -1e18;
        for (int j = 0; j < S; ++j) {
            double dot = 0;
            for (int c = 0; c < dk; ++c) dot += Q[i][c] * K[j][c];
            scores[j] = dot / scale;
            maxS = max(maxS, scores[j]);
        }
        double sumE = 0;
        for (int j = 0; j < S; ++j) {
            scores[j] = exp(scores[j] - maxS);
            sumE += scores[j];
        }
        for (int c = 0; c < dk; ++c) {
            double val = 0;
            for (int j = 0; j < S; ++j) val += (scores[j] / sumE) * V[j][c];
            cout << (c ? " " : "") << val;
        }
        cout << "\\n";
    }
    return 0;
}
""",
        },
        "test_cases": [
            {"input": "2 2\n1.0 0.0\n0.0 1.0\n1.0 0.0\n0.0 1.0\n10.0 20.0\n30.0 40.0", "expected_output": "16.60 26.60\n23.40 33.40", "is_hidden": False},
            {"input": "1 2\n1.0 1.0\n1.0 1.0\n5.0 5.0", "expected_output": "5.00 5.00", "is_hidden": False},
        ],
        "hints": [
            "Remember to transpose K when computing QK^T.",
            "Softmax must be calculated across each row independently.",
        ],
        "expected_complexity": {"time": "O(S^2 * d_k)", "space": "O(S^2)"},
        "is_ai_generated": False,
        "tags": ["machine-learning", "transformers", "attention", "deep-learning", "llm"],
        "acceptance_rate": 61.4,
        "total_submissions": 980,
    },
    {
        "id": "c-ml-kmeans",
        "title": "K-Means Clustering Centroid Assignment",
        "slug": "kmeans-clustering-centroids",
        "difficulty": "Medium",
        "category": "Machine Learning",
        "problem_type": "Unsupervised Learning",
        "time_limit_ms": 2000,
        "memory_limit_mb": 256,
        "description": """### Problem Statement
Implement one full **Expectation-Maximization step** of **K-Means Clustering** on 2D data points.

Given `N` 2D points `(x_i, y_i)` and `K` initial centroids `(cx_k, cy_k)`, perform `iters` iterations of:
1. **Assign** each point to the nearest centroid using squared Euclidean distance (break ties by smallest centroid index).
2. **Update** each centroid to the arithmetic mean of points assigned to it (keep previous centroid if a cluster is empty).

Output the final `K` centroids rounded to 2 decimal places.""",
        "constraints": ["1 <= N <= 5000", "1 <= K <= 20", "1 <= iters <= 100"],
        "input_format": "First line: N K iters. Next N lines: x y points. Next K lines: initial cx cy centroids.",
        "output_format": "K lines with updated cx cy rounded to 2 decimal places.",
        "examples": [
            {
                "input": "4 2 5\n0 0\n1 1\n10 10\n11 11\n0 1\n10 11",
                "output": "0.50 0.50\n10.50 10.50",
                "explanation": "Points cleanly partition into {0,1} and {10,11} clusters.",
            }
        ],
        "starter_code": {
            "python": """import sys

def kmeans(points, centroids, iters):
    k = len(centroids)
    c = [list(pt) for pt in centroids]
    for _ in range(iters):
        clusters = [[] for _ in range(k)]
        for px, py in points:
            best_idx = 0
            best_dist = float('inf')
            for idx, (cx, cy) in enumerate(c):
                d = (px - cx) ** 2 + (py - cy) ** 2
                if d < best_dist:
                    best_dist = d
                    best_idx = idx
            clusters[best_idx].append((px, py))
        for idx in range(k):
            if clusters[idx]:
                c[idx][0] = sum(p[0] for p in clusters[idx]) / len(clusters[idx])
                c[idx][1] = sum(p[1] for p in clusters[idx]) / len(clusters[idx])
    return c

if __name__ == '__main__':
    tokens = sys.stdin.read().split()
    if len(tokens) >= 3:
        n, k, iters = int(tokens[0]), int(tokens[1]), int(tokens[2])
        idx = 3
        points = []
        for _ in range(n):
            points.append((float(tokens[idx]), float(tokens[idx + 1])))
            idx += 2
        centroids = []
        for _ in range(k):
            centroids.append((float(tokens[idx]), float(tokens[idx + 1])))
            idx += 2
        for cx, cy in kmeans(points, centroids, iters):
            print(f"{cx:.2f} {cy:.2f}")
""",
            "javascript": """const fs = require('fs');

const tokens = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
if (tokens.length >= 3) {
  const n = parseInt(tokens[0], 10);
  const k = parseInt(tokens[1], 10);
  const iters = parseInt(tokens[2], 10);
  let idx = 3;
  const pts = [];
  for (let i = 0; i < n; i++) pts.push([parseFloat(tokens[idx++]), parseFloat(tokens[idx++])]);
  const c = [];
  for (let i = 0; i < k; i++) c.push([parseFloat(tokens[idx++]), parseFloat(tokens[idx++])]);

  for (let it = 0; it < iters; it++) {
    const groups = Array.from({ length: k }, () => []);
    for (const [px, py] of pts) {
      let best = 0, bestD = Infinity;
      for (let j = 0; j < k; j++) {
        const d = (px - c[j][0]) ** 2 + (py - c[j][1]) ** 2;
        if (d < bestD) { bestD = d; best = j; }
      }
      groups[best].push([px, py]);
    }
    for (let j = 0; j < k; j++) {
      if (groups[j].length > 0) {
        c[j][0] = groups[j].reduce((s, p) => s + p[0], 0) / groups[j].length;
        c[j][1] = groups[j].reduce((s, p) => s + p[1], 0) / groups[j].length;
      }
    }
  }
  for (const [cx, cy] of c) console.log(`${cx.toFixed(2)} ${cy.toFixed(2)}`);
}
""",
            "typescript": """import * as fs from 'node:fs';

const tokens: string[] = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
if (tokens.length >= 3) {
  const n = parseInt(tokens[0], 10);
  const k = parseInt(tokens[1], 10);
  const iters = parseInt(tokens[2], 10);
  let idx = 3;
  const pts: [number, number][] = [];
  for (let i = 0; i < n; i++) pts.push([parseFloat(tokens[idx++]), parseFloat(tokens[idx++])]);
  const c: [number, number][] = [];
  for (let i = 0; i < k; i++) c.push([parseFloat(tokens[idx++]), parseFloat(tokens[idx++])]);

  for (let it = 0; it < iters; it++) {
    const groups: [number, number][][] = Array.from({ length: k }, () => []);
    for (const [px, py] of pts) {
      let best = 0;
      let bestD = Infinity;
      for (let j = 0; j < k; j++) {
        const d = (px - c[j][0]) ** 2 + (py - c[j][1]) ** 2;
        if (d < bestD) { bestD = d; best = j; }
      }
      groups[best].push([px, py]);
    }
    for (let j = 0; j < k; j++) {
      if (groups[j].length > 0) {
        c[j][0] = groups[j].reduce((s, p) => s + p[0], 0) / groups[j].length;
        c[j][1] = groups[j].reduce((s, p) => s + p[1], 0) / groups[j].length;
      }
    }
  }
  for (const [cx, cy] of c) console.log(`${cx.toFixed(2)} ${cy.toFixed(2)}`);
}
""",
            "cpp": """#include <iostream>
#include <vector>
#include <iomanip>
#include <limits>
using namespace std;

int main() {
    int n, k, iters;
    if (!(cin >> n >> k >> iters)) return 0;
    vector<pair<double,double>> pts(n), c(k);
    for (int i = 0; i < n; ++i) cin >> pts[i].first >> pts[i].second;
    for (int i = 0; i < k; ++i) cin >> c[i].first >> c[i].second;

    for (int it = 0; it < iters; ++it) {
        vector<double> sx(k, 0), sy(k, 0);
        vector<int> cnt(k, 0);
        for (auto &[px, py] : pts) {
            int best = 0;
            double bestD = numeric_limits<double>::infinity();
            for (int j = 0; j < k; ++j) {
                double d = (px - c[j].first) * (px - c[j].first) + (py - c[j].second) * (py - c[j].second);
                if (d < bestD) { bestD = d; best = j; }
            }
            sx[best] += px;
            sy[best] += py;
            cnt[best]++;
        }
        for (int j = 0; j < k; ++j) {
            if (cnt[j] > 0) { c[j].first = sx[j] / cnt[j]; c[j].second = sy[j] / cnt[j]; }
        }
    }
    cout << fixed << setprecision(2);
    for (auto &[cx, cy] : c) cout << cx << " " << cy << "\\n";
    return 0;
}
""",
        },
        "test_cases": [
            {"input": "4 2 5\n0 0\n1 1\n10 10\n11 11\n0 1\n10 11", "expected_output": "0.50 0.50\n10.50 10.50", "is_hidden": False},
            {"input": "4 2 3\n0 0\n2 0\n10 0\n12 0\n1 0\n11 0", "expected_output": "1.00 0.00\n11.00 0.00", "is_hidden": True},
        ],
        "hints": [
            "Assign each point to its closest centroid using Euclidean distance squared.",
            "Skip updating centroids that have zero assigned points.",
        ],
        "expected_complexity": {"time": "O(iters * N * K)", "space": "O(N + K)"},
        "is_ai_generated": False,
        "tags": ["machine-learning", "clustering", "kmeans", "unsupervised"],
        "acceptance_rate": 74.5,
        "total_submissions": 1120,
    },
]


def _challenge_from_dict(c_data: Dict[str, Any]) -> Challenge:
    return Challenge(
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
        total_submissions=c_data["total_submissions"],
    )


def seed_initial_challenges(db: Session):
    all_challenges = SEED_CHALLENGES + generate_all_bank_challenges()
    core_ids = {c["id"] for c in SEED_CHALLENGES}
    existing_ids = {row[0] for row in db.query(Challenge.id).all()}
    existing_core = {
        c.id: c
        for c in db.query(Challenge).filter(Challenge.id.in_(list(core_ids))).all()
    }

    to_insert: List[Challenge] = []
    for c_data in all_challenges:
        cid = c_data["id"]
        if cid in existing_core:
            existing = existing_core[cid]
            existing.test_cases = c_data["test_cases"]
            existing.examples = c_data["examples"]
            existing.starter_code = c_data["starter_code"]
            existing.description = c_data["description"]
        elif cid not in existing_ids:
            to_insert.append(_challenge_from_dict(c_data))
            existing_ids.add(cid)

    if to_insert:
        db.add_all(to_insert)
    db.commit()


def _ensure_challenge_bank_seeded(db: Session):
    if db.query(Challenge.id).count() < 350:
        seed_initial_challenges(db)


@router.get("/stats")
def get_challenge_stats(db: Session = Depends(get_db)):
    _ensure_challenge_bank_seeded(db)
    rows = db.query(Challenge.difficulty, Challenge.category).all()
    by_difficulty: Dict[str, int] = {"Easy": 0, "Medium": 0, "Hard": 0}
    by_category: Dict[str, int] = {}
    for diff, cat in rows:
        if diff in by_difficulty:
            by_difficulty[diff] += 1
        elif diff:
            by_difficulty[diff] = by_difficulty.get(diff, 0) + 1
        if cat:
            by_category[cat] = by_category.get(cat, 0) + 1

    return {
        "total": len(rows),
        "by_difficulty": by_difficulty,
        "by_category": dict(sorted(by_category.items(), key=lambda kv: (-kv[1], kv[0]))),
    }


@router.get("", response_model=List[ChallengeResponse])
def get_challenges(
    search: Optional[str] = None,
    difficulty: Optional[str] = None,
    category: Optional[str] = None,
    limit: Optional[int] = Query(default=None, ge=1, le=1000),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
):
    _ensure_challenge_bank_seeded(db)
    query = db.query(Challenge)
    if search:
        term = f"%{search}%"
        query = query.filter(
            Challenge.title.ilike(term)
            | Challenge.description.ilike(term)
            | Challenge.category.ilike(term)
        )
    if difficulty and difficulty != "All":
        query = query.filter(Challenge.difficulty == difficulty)
    if category and category != "All":
        query = query.filter(Challenge.category == category)

    query = query.order_by(Challenge.created_at.desc(), Challenge.id.asc())
    if limit is not None:
        query = query.offset(offset).limit(limit)
    return query.all()


@router.get("/{challenge_id}", response_model=ChallengeResponse)
def get_challenge(challenge_id: str, db: Session = Depends(get_db)):
    challenge = db.query(Challenge).filter((Challenge.id == challenge_id) | (Challenge.slug == challenge_id)).first()
    if not challenge:
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
        examples=[e.model_dump() for e in payload.examples],
        starter_code=payload.starter_code,
        test_cases=[tc.model_dump() for tc in payload.test_cases],
        hints=payload.hints,
        expected_complexity=payload.expected_complexity.model_dump() if payload.expected_complexity else {"time": "O(N)", "space": "O(1)"},
        tags=payload.tags,
        is_ai_generated=payload.is_ai_generated,
    )
    db.add(challenge)
    db.commit()
    db.refresh(challenge)
    return challenge
