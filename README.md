# Rememberme

Project memory across coding sessions, combining:

- **brain.md**: durable decisions, requirements, constraints, and evidence in Markdown.
- **Context Mode** (`every-session/`): searchable working context.
- **Harness² synergy** (`synergy/`): execution feedback and reusable lessons.
- **Rememberme skill** (`SKILL.md`): a workflow connecting these layers.

## Install project memory

Requires Node.js 18+ and a POSIX shell. The bundled brain tools need no npm download
or API key.

```bash
git clone https://github.com/almanalaysay93-gif/rememberme.git
cd rememberme
bash install-brain.sh
# Equivalent: bash install-all.sh --brain-only
export PATH="$HOME/bin:$PATH"
```

The installer copies the CLI to `~/.local/share/rememberme/brain-md`, creates
`~/bin/brain`, and installs Rememberme and the four upstream brain skills into
existing Claude Code, Codex, OpenCode, Cursor, and Pi skill directories. If none
exists, it creates `~/.codex` as the default. Restart your agent to discover the
skills. Existing skill directories are backed up by the upstream installer; if a
backup already exists, it reports a skip. Re-running refreshes managed copies.
It does not edit shell profiles, initialize projects, or install lifecycle hooks.

For the original full bundle, run `bash install-all.sh`. This also downloads
Context Mode and Harness² and applies their existing agent configurations. Review
[every-session](every-session/README.md) and [synergy](synergy/README.md) before
using this path with customized settings.

## Use in a project

```bash
cd /path/to/your/project
brain init
brain list-pages
```

`init` creates `BRAIN.md` and the brain skeleton and merges a marked memory block
into `CLAUDE.md` and `AGENTS.md`. Existing brain content is preserved, including a
custom `brainRoot` in `.mindmux/preferences.json`. Invoke **rememberme** to recall
or maintain knowledge and **brain-bootstrap** to seed pages from project evidence.
**brain-page** documents reads and writes; **brain-ingest** handles external
material; **brain-setup** covers setup and optional hooks.

```bash
brain create-page --id storage-choice --category decision --title "Use Markdown for memory"
printf '%s\n' 'Use Markdown for portable, reviewable project memory.' |
  brain update-truth --id storage-choice --summary "Record the agreed storage decision"
brain read-page storage-choice
brain lint-links
```

Use CLI commands for brain reads and writes. Updates keep the current understanding
and append an explanation to the timeline. Capture settled knowledge and evidence;
keep secrets, raw logs, and temporary status out of the brain. Context Mode and
Harness² are optional; this integration does not automatically copy their SQLite data.

Optional project snapshots: `brain install-hooks` (Claude Code) or
`brain install-hooks --agent codex` (Codex CLI 0.153.4+, POSIX sh/awk). See the
[upstream guide](vendor/brain-md/README.md) for trust and runtime limitations.

## Verify and uninstall

```bash
node --test tests/brain-integration.test.mjs
node --test vendor/brain-md/skills/brain-page/test/*.test.mjs
brain uninstall -y
```

Uninstall removes skills tracked by brain.md's shared installation manifest,
including any separately installed brain.md skills; project memory is preserved.
The copied toolchain and `~/bin/brain` launcher remain; remove these manually if
no longer needed.

## Attribution

Bundles [mindmuxai/brain.md](https://github.com/mindmuxai/brain.md) v0.4.1 under
Apache-2.0. See [provenance](vendor/brain-md/UPSTREAM.md) and the bundled
[license](vendor/brain-md/LICENSE). Original Context Mode and Harness² bundle
files remain in their existing directories.
