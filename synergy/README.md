# Harness² + Context Mode — SYNERGISTIC Every-Session Bundle

This is v2 — not just 2 installs side-by-side, but 5 feedback loops so they make each other better.

## The Synergy (why 1+1=3)

Harness² alone: Proposes K harnesses, Probes them (6x tool calls), Composes best.
Problem: 6x Playwright snapshots (56KB each) + 20 GitHub issues (59KB) = 300KB+ per probe = OOM after 30min.

Context Mode alone: Saves 98% tokens by sandboxing, but doesn't learn.

Together with SYNERGY:

1. **Probe -> Index Loop**: All K parallel probes write to ONE shared SQLite FTS5 DB (WAL mode)
   harness2 --k 3 parallel = 6 probes -> 1 DB at runs/<task>/context.db
   Raw 315KB * 6 = 1.8MB would kill context, with CM it's 5.4KB * 6 = 32KB

2. **Search -> Compose Loop**: Composer doesn't read raw logs. It calls ctx-compose-evidence.js
   which does BM25 query across all probes: "which guardrail reduced errors?"
   Composer gets contrastive summary, not dumps.

3. **Lesson -> Persistence Loop**: Harness²'s improvement harness (lessons) is stored IN Context Mode's DB
   Next session, SessionStart hook injects top lessons via BM25 search: "relevant to WorkBuddy office task"
   So Context Mode becomes long-term memory for Harness².

4. **Token Budget -> Guardrail Loop**: ctx-stats feeds into Harness² guardrail
   If probe exceeds 150k tokens, abort. Harness² learns to prefer token-efficient harnesses.

5. **Think-in-Code -> Tool Loop**: Enforced via tool_guidance: no Read() in loop, must use ctx_execute()
   47 x Read = 700KB -> 1 x ctx_execute = 3.6KB. Harness²'s editor is forced to propose this.

Result: You can run --k 5 parallel (10 candidates) without hitting 200k window, and improvement harness actually compounds.

## What's in this zip

- configs/ for every CLI agent (Claude Code, OpenCode, Codex, Gemini CLI, VS Code Copilot, Cursor)
- harness2/ improvement-harness + base patch with synergy loops
- scripts/ dev (daily driver), ctx-compose-evidence.js (the glue), synergy-test.sh
- install.sh does everything + sets env vars

## Install

unzip harness2-cm-synergy.zip
cd harness2-cm-synergy
chmod +x install.sh scripts/*.sh
./install.sh

Then inside any agent:
ctx-doctor   # should be all [x]
ctx-stats    # live savings
harness2-check

Daily:
~/bin/dev    # starts session with both
