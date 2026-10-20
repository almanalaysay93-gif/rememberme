#!/bin/bash
set -e
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
echo "==> rememberme installed — restart shell: exec zsh"
