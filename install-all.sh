#!/bin/bash
set -e
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"
if [ "${1:-}" = "--brain-only" ] && [ "$#" -eq 1 ]; then
  exec bash "$SCRIPT_DIR/install-brain.sh"
fi
if [ "$#" -ne 0 ]; then
  echo "Usage: bash install-all.sh [--brain-only]" >&2
  exit 2
fi
echo "==> rememberme — installing both every-session + synergy"
echo "--- Installing every-session ---"
cd every-session
chmod +x install.sh
./install.sh || echo "warnings, continuing"
cd ..
echo ""
echo "--- Installing synergy (upgrades with shared DB) ---"
cd synergy
chmod +x install.sh scripts/*.sh
./install.sh || echo "warnings"
cd ..
echo "--- Installing brain.md + Rememberme skills ---"
bash "$SCRIPT_DIR/install-brain.sh"
echo "==> rememberme installed — ensure ~/bin is on PATH; run brain init in your project"
