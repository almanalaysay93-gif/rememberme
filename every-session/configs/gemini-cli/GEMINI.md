# Context Mode Routing - Gemini CLI

- ALWAYS use ctx_execute / ctx_batch_execute for files >5KB or loops
- Use ctx_search to query indexed content, not Read
- Think in code: write script that logs result, don't read 50 files
- ctx stats shows savings
