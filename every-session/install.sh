#!/bin/bash
set -e
echo "==> Harness² + Context Mode Every-Session Installer"

# 1. Check Node
if ! command -v node &> /dev/null && ! command -v bun &> /dev/null; then
  echo "Node.js >=22.5 or Bun required for context-mode. Install Node first."
  exit 1
fi

echo "==> Installing context-mode globally..."
npm install -g context-mode || { echo "npm install failed, trying bun..."; bun install -g context-mode; }

echo "==> Setting up Harness² (Python 3.12 + uv)"
if ! command -v uv &> /dev/null; then
  echo "Installing uv..."
  curl -LsSf https://astral.sh/uv/install.sh | sh
  export PATH="$HOME/.cargo/bin:$PATH"
fi

# Try to clone harness2 if not present
if [ ! -d "./harness2-src" ]; then
  echo "Cloning google-research/harness2..."
  git clone https://github.com/google-research/harness2.git harness2-src || echo "Clone failed, skipping harness2 install, configs still usable"
fi

if [ -d "./harness2-src" ]; then
  cd harness2-src
  uv venv --python 3.12 .venv || uv venv --python 3.12
  source .venv/bin/activate
  uv pip install -e '.[render]' || uv pip install -e .
  echo "Harness² installed in .venv"
  cd ..
fi

echo "==> Creating dirs"
mkdir -p ~/.harness2/runs/_global
mkdir -p ~/.claude ~/.config/opencode ~/.codex ~/.gemini ~/.vscode

# 2. Claude Code - statusline + plugin hint
echo "==> Configuring Claude Code"
if [ -f ~/.claude/settings.json ]; then
  echo "Backing up ~/.claude/settings.json -> ~/.claude/settings.json.bak"
  cp ~/.claude/settings.json ~/.claude/settings.json.bak
fi
cat configs/claude-code/settings-patch.json > /tmp/cm_settings.json
echo "Add this to ~/.claude/settings.json manually if you have custom settings:"
cat /tmp/cm_settings.json
echo ""
echo "Run inside Claude Code: /plugin marketplace add mksglu/context-mode && /plugin install context-mode@context-mode"

# 3. OpenCode
if [ -d ~/.config/opencode ] || command -v opencode &> /dev/null; then
  echo "==> Installing OpenCode MCP config"
  cp configs/opencode/mcp.json ~/.config/opencode/mcp.json 2>/dev/null || mkdir -p ~/.config/opencode && cp configs/opencode/mcp.json ~/.config/opencode/mcp.json
fi

# 4. Gemini CLI
echo "==> Installing Gemini CLI config (merge manually if you have existing)"
cat configs/gemini-cli/settings.json
echo "Copy the above into ~/.muse/settings.json"

# 5. VS Code Copilot
echo "==> VS Code Copilot configs are in configs/vscode-copilot/ - copy .vscode/mcp.json and .github/hooks/context-mode.json into your project root"

# 6. Harness² global improvement harness
echo "==> Setting up global improvement harness"
cp harness2/improvement-harness.json ~/.harness2/improvement-harness.json 2>/dev/null || cp harness2/improvement-harness.json ~/.harness2/runs/_global/improvement-harness.json

# 7. Shell env
SHELL_RC="$HOME/.zshrc"
[ -f "$HOME/.bashrc" ] && SHELL_RC="$HOME/.bashrc"
echo "" >> $SHELL_RC
echo "# Harness² + Context Mode Every-Session" >> $SHELL_RC
echo 'export HARNESS2_RUNS_DIR="$HOME/.harness2/runs"' >> $SHELL_RC
echo 'export CONTEXT_MODE_SHARED_DB="$HOME/.harness2/runs/_global/context.db"' >> $SHELL_RC
echo "Added env vars to $SHELL_RC - restart shell"

# 8. Daily driver
chmod +x scripts/dev
cp scripts/dev ~/bin/dev 2>/dev/null || mkdir -p ~/bin && cp scripts/dev ~/bin/dev
echo "Daily driver installed to ~/bin/dev"

echo "==> Running checks"
context-mode doctor || npx -y context-mode doctor || echo "Run ctx-doctor inside your agent"
echo ""
echo "Done! Restart your CLI agents. Run 'ctx-stats' inside agent to see savings."
