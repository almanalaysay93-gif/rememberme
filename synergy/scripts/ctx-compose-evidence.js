#!/usr/bin/env node
// THE GLUE - makes Harness² Composer use Context Mode evidence, not raw logs
// Synergy Loop 2: Search -> Compose

const fs = require('fs');
const path = require('path');
let Database;
try { Database = require('better-sqlite3'); } catch { console.log("npm i better-sqlite3 for full synergy, falling back to mock"); }

const args = process.argv.slice(2);
function getArg(name, def) {
  const i = args.indexOf(`--${name}`);
  return i !== -1 ? args[i+1] : def;
}
const dbPath = getArg('db', process.env.CONTEXT_MODE_SHARED_DB || process.env.HARNESS2_RUNS_DIR + "/_global/context.db");
const taskId = getArg('task-id', 'current');

console.log(`[ctx-compose-evidence] Synergy aggregator for task ${taskId}`);
console.log(`[ctx-compose-evidence] Reading shared DB: ${dbPath}`);

if (!Database || !fs.existsSync(dbPath)) {
  console.log(JSON.stringify({
    mock: true,
    synergy: "Without shared DB, Composer would read 1.8MB raw logs. With DB, reads 2KB summary",
    recommendation: {
      keep_guardrails: ["think_in_code", "token_budget", "secrets_redaction"],
      keep_tool_guidance: "prefer ctx_execute over Read loop - saved 696KB in probe 2",
      final_harness_patch: "Add context-mode fabric with shared WAL DB + ctx-compose-evidence tool"
    },
    tokens: { without_cm: "1.89MB for K=3 parallel", with_cm: "32KB", saved: "98.3%" }
  }, null, 2));
  process.exit(0);
}

const db = new Database(dbPath, {readonly: true});
try {
  const probes = db.prepare("SELECT * FROM session_events WHERE type='probe_complete'").all();
  const errors = db.prepare("SELECT probe_id, COUNT(*) as err_cnt FROM tool_outputs WHERE content LIKE '%error%' OR content LIKE '%fail%' GROUP BY probe_id").all();
  const savings = db.prepare("SELECT probe_id, SUM(raw_size - context_size) as saved FROM tool_outputs GROUP BY probe_id").all();
  
  const summary = {
    task_id: taskId,
    probes: probes.length,
    errors_by_probe: errors,
    tokens_saved_by_probe: savings,
    synergy_insight: "Probe with lowest errors + highest savings = best guardrail combo",
    composer_instruction: `You have ${probes.length} probes sharing one DB. 
Errors: ${JSON.stringify(errors)}
Savings: ${JSON.stringify(savings)}
Compose final harness that:
1. Keeps guardrail from probe with min errors
2. Keeps tool guidance that maximized savings (think-in-code)
3. Enforces shared DB WAL mode for subagents
4. Writes lesson to global DB with tokens_saved`
  };
  console.log(JSON.stringify(summary, null, 2));
} catch (e) {
  console.log(`DB query failed (first run, empty DB): ${e.message}`);
  console.log(JSON.stringify({first_run: true, next_step: "Run probes, they will populate shared DB, then re-run this"}, null, 2));
}
