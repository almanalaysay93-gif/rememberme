#!/bin/bash
echo "=== Testing Harness² + Context Mode Synergy ==="
echo "1. Context Mode doctor..."
context-mode doctor 2>/dev/null || npx -y context-mode doctor || echo "Install context-mode: npm i -g context-mode"

echo ""
echo "2. Shared DB exists?"
ls -lh ${HARNESS2_RUNS_DIR:-$HOME/.harness2/runs}/_global/context.db 2>&1 || echo "No global DB yet - will be created on first task"

echo ""
echo "3. Improvement harness?"
cat ${HARNESS2_RUNS_DIR:-$HOME/.harness2/runs}/_global/improvement-harness.json 2>/dev/null | head -30 || cat ~/.harness2/improvement-harness.json 2>/dev/null | head -30 || echo "No improvement harness yet"

echo ""
echo "4. Synergy glue script..."
node scripts/ctx-compose-evidence.js --db ${HARNESS2_RUNS_DIR:-$HOME/.harness2/runs}/_global/context.db 2>&1 | head -40

echo ""
echo "=== Synergy check done ==="
echo "If you saw savings 98% and shared DB path, synergy is active"
