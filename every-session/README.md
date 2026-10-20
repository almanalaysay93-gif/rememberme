# Harness² + Context Mode — Every-Session Bundle

This zip makes Context Mode run every session + Harness²'s recursive improvement harness persist across sessions.

**What you get:**
- Context Mode MCP server installed globally (npm) — sandboxes tool outputs, 315KB -> 5.4KB (98%)
- Harness² installed (uv, Python 3.12) with a global improvement harness that learns every task
- Pre-made configs for: Claude Code, OpenCode, Codex, Gemini CLI, VS Code Copilot, JetBrains Copilot, Cursor

**Quick install:**
```bash
unzip harness2-cm-every-session.zip
cd harness2-cm-every-session
chmod +x install.sh
./install.sh
```

**What install.sh does:**
1. Checks Node >=22.5 / Bun and Python 3.12
2. `npm install -g context-mode`
3. `uv pip install -e '.[render]'` for harness2 (from google-research/harness2 if present, otherwise local)
4. Copies MCP + hooks configs to your home for each CLI agent you have
5. Sets HARNESS2_RUNS_DIR and CONTEXT_MODE_SHARED_DB in your shell profile
6. Runs ctx-doctor + harness2-check

**Manual Claude Code (if you prefer):**
```
/plugin marketplace add mksglu/context-mode
/plugin install context-mode@context-mode
/context-mode:ctx-doctor
```

**Verify every session:**
- `ctx-stats` -> shows $ saved this session
- `ctx-doctor` -> all [x]
- `harness2-report --bench <bench> --k <k> --mode parallel`

Built from: github.com/mksglu/context-mode and github.com/google-research/harness2
