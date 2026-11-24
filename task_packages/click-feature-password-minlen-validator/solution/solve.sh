#!/bin/bash
set -e

# Apply reference solution patch to /app
cd /app
if [ -f /solution/solution.patch ]; then
    git apply /solution/solution.patch
elif [ -f solution.patch ]; then
    git apply solution.patch
fi

# Re-install package to ensure in-tree bytecode or metadata is updated
pip install -e . --no-deps
