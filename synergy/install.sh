#!/bin/bash
set -e
echo "==> Harness²-CM SYNERGY Installer"

# Node check
if ! command -v node &>/dev/null && ! command -v bun &>/dev/null; then
  echo "Need Node >=22.5 or Bun"; exit 1
fi

echo "==> Installing context-mode globally (provides 11 tools)"
npm install -g context-mode || bun install -g context-mode

echo "==> Installing Harness²"
if ! command -v uv &>/dev/null; then
  curl -LsSf https://astral.sh/uv/install.sh | sh
  export PATH="$HOME/.cargo/bin:$PATH"
fi

if [ ! -d "./harness2-src" ]; then
  git clone https://github.com/google-research/harness2.git harness2-src || true
fi

if [ -d "./harness2-src" ]; then
  cd harness2-src
  uv venv --python 3.12 .venv 2>/dev/null || true
  source .venv/bin/activate 2>/dev/null || true
  uv pip install -e '.[render]' 2>/dev/null || uv pip install -e . || true
  cd ..
fi

echo "==> Creating global dirs"
mkdir -p ~/.harness2/runs/_global
mkdir -p ~/.claude ~/.config/opencode ~/.codex ~/.gemini ~/.vscode
mkdir -p ~/bin

# Claude Code
echo "==> Claude Code: run inside Claude Code:"
echo "  /plugin marketplace add mksglu/context-mode"
echo "  /plugin install context-mode@context-mode"
echo "  Then add to ~/.claude/settings.json:"
cat configs/claude-code/settings.json

# Copy MCP configs if agents exist
[ -f configs/opencode/mcp.json ] && mkdir -p ~/.config/opencode && cp configs/opencode/mcp.json ~/.config/opencode/mcp.json && echo "OpenCode MCP installed"
[ -f configs/gemini-cli/settings.json ] && echo "For Gemini, merge configs/gemini-cli/settings.json into ~/.muse/settings.json"

# Global improvement harness (shared memory)
cp harness2/improvement-harness.json ~/.harness2/runs/_global/improvement-harness.json
cp harness2/improvement-harness.json ~/.harness2/improvement-harness.json 2>/dev/null || true
echo "Improvement harness installed"

# Shell env for every session
RC="$HOME/.zshrc"
[ -f "$HOME/.bashrc" ] && RC="$HOME/.bashrc"
if ! grep -q "HARNESS2_RUNS_DIR" "$RC"; then
  echo "" >> "$RC"
  echo "# Harness² + Context Mode Synergy - every session" >> "$RC"
  echo 'export HARNESS2_RUNS_DIR="$HOME/.harness2/runs"' >> "$RC"
  echo 'export CONTEXT_MODE_SHARED_DB="$HOME/.harness2/runs/_global/context.db"' >> "$RC"
  echo 'export CONTEXT_MODE_WAL=1' >> "$RC"
  echo "Added to $RC"
fi

# Daily driver + glue scripts
chmod +x scripts/dev scripts/*.sh
cp scripts/dev ~/bin/dev
cp scripts/ctx-compose-evidence.js ~/bin/ctx-compose-evidence.js 2>/dev/null || true
cp scripts/synergy-test.sh ~/bin/synergy-test 2>/dev/null || true

echo ""
echo "==> Checking synergy"
./scripts/synergy-test.sh || true
echo ""
echo "Done! Restart shell, then open any CLI agent."
echo "Inside agent: ctx-doctor (all [x]), ctx-stats, and your improvement harness auto-loads."
