# How the 2 work synergistically

ARCHITECTURE:

[Model - fixed weights]
   |
[Context Fabric] <- Context Mode: intercepts ALL tool calls, FTS5, BM25, <2KB snapshot on compact
   |
[Execution Harness] <- Harness² 8 components: system prompt, guardrails, memory, tool guidance, subagents, skills, scripts, plugins
   |
[Meta Harness] <- Improvement Harness: lessons + adopted harnesses, stored in Fabric DB

DATA FLOW for --k 3 parallel:

Task arrives
  -> Task-level recursion: Editor proposes 3 general + 3 domain edits
  -> 6 Probes start, each with own subagents
  -> Each probe's Read/Bash/WebFetch is intercepted by Context Fabric
     Raw output -> chunked -> indexed into shared runs/<task>/context.db (WAL)
     Probe only gets "indexed, 59KB -> 1.1KB summary"
  -> Probes finish, write session_events to same DB
  -> ctx-compose-evidence.js queries DB:
     SELECT guardrail, AVG(errors), SUM(tokens_saved) GROUP BY guardrail
  -> Composer receives: "guardrail 'no Read() loop' saved 696KB and reduced errors 40%"
  -> Composer outputs refined harness
  -> Harnessing-level recursion: Reflector extracts lesson + evidence + tokens_saved
  -> Lesson written to _global/context.db lessons table
  -> Next task: SessionStart hook does ctx_search("relevant lessons for LAB antitrust")

Without Fabric: Composer would need to read 6 * 300KB = 1.8MB raw logs -> fails.
With Fabric: Composer reads 2KB aggregated evidence -> succeeds.

Token accounting:
- Before: 56KB snapshot + 59KB issues + 45KB log = 315KB -> 5.4KB (98%)
- Parallel K=3: Without: 1.89MB context (OOM). With: 32KB context (fine)
