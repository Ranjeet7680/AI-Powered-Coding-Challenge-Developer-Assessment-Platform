#!/bin/bash
set -e

mkdir -p /logs/verifier
REWARD_FILE="/logs/verifier/reward.txt"

# Copy new feature test into target repo test suite
cp /tests/test_feature.py /app/tests/

cd /app

# Step 1: Run existing regression tests (must all pass)
echo "=== Running Existing Regression Tests ==="
REGRESSION_FAILED=0
if [ -f /tests/pass_to_pass.json ]; then
    python3 -c '
import json, sys
tests = json.load(open("/tests/pass_to_pass.json"))
print(" ".join(tests))
' > /tmp/regression_targets.txt
    
    if [ -s /tmp/regression_targets.txt ]; then
        if ! pytest $(cat /tmp/regression_targets.txt) -q; then
            echo "Regression tests failed!"
            REGRESSION_FAILED=1
        fi
    fi
fi

if [ $REGRESSION_FAILED -eq 1 ]; then
    echo 0.0 > $REWARD_FILE
    exit 0
fi

# Step 2: Run new feature tests
echo "=== Running New Feature Tests ==="
if pytest tests/test_feature.py -rA; then
    echo "Feature tests passed!"
    echo 1.0 > $REWARD_FILE
else
    echo "Feature tests failed (expected on baseline/nop)."
    echo 0.0 > $REWARD_FILE
fi
