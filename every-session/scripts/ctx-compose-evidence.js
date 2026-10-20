// ctx-compose-evidence.js
// Aggregates evidence across K parallel probes for Harness² Composer
// Usage: node ctx-compose-evidence.js --db runs/task/context.db --task-id xyz

const Database = require('better-sqlite3');
const args = require('minimist')(process.argv.slice(2));
const dbPath = args.db || process.env.CONTEXT_MODE_SHARED_DB;
if (!dbPath) {
  console.error("Need --db path or CONTEXT_MODE_SHARED_DB env");
  process.exit(1);
}
const db = new Database(dbPath);

console.log(`Reading evidence from ${dbPath}`);

// Get all probes for task
const probes = db.prepare("SELECT * FROM session_events WHERE type='probe_complete'").all();
const errors = db.prepare("SELECT probe_id, COUNT(*) as cnt FROM tool_outputs WHERE content LIKE '%error%' GROUP BY probe_id").all();
const lessons = db.prepare("SELECT * FROM lessons ORDER BY tokens_saved DESC LIMIT 10").all();

const summary = {
  probes: probes.length,
  errors_by_probe: errors,
  top_lessons: lessons,
  recommendation: "Compose harness that keeps guardrail from probe with lowest errors + tool guidance from probe with highest token savings"
};

console.log(JSON.stringify(summary, null, 2));

// Also output contrastive prompt for Composer
console.log("\n--- COMPOSER PROMPT ---");
console.log(`You have ${probes.length} probes. Errors: ${JSON.stringify(errors)}. 
Compose a final harness that:
1. Keeps guardrails that reduced errors
2. Keeps tool guidance that saved tokens
3. Uses ctx_execute instead of Read loops
`);
