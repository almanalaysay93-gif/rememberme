#!/bin/bash
echo "Checking Context Mode..."
context-mode doctor || npx -y context-mode doctor
echo ""
echo "Checking Harness²..."
harness2-check --bench jb 2>&1 | head -20 || echo "harness2-check not found, install harness2 first"
echo ""
echo "Checking env..."
echo "HARNESS2_RUNS_DIR=$HARNESS2_RUNS_DIR"
echo "CONTEXT_MODE_SHARED_DB=$CONTEXT_MODE_SHARED_DB"
