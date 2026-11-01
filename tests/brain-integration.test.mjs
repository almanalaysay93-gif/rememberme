import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const repo = dirname(dirname(fileURLToPath(import.meta.url)));
function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'rememberme-'));
  // Exercise shell quoting in the installed launcher.
  const home = join(root, "user's home");
  const project = join(root, 'project');
  mkdirSync(home); mkdirSync(project);
  const env = { ...process.env, HOME: home, XDG_STATE_HOME: join(home, '.state') };
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const run = (command, args, input) => {
    const r = spawnSync(command, args, { cwd: project, env, encoding: 'utf8', input });
    assert.equal(r.status, 0, `${r.error || ''}\n${r.stdout}\n${r.stderr}`);
    return r.stdout;
  };
  return { home, project, env, run, install: () => run('bash', [join(repo, 'install-all.sh'), '--brain-only']),
    brain: (args, input) => run(join(home, 'bin', 'brain'), args, input) };
}

test('installs five skills without initializing the caller project or touching settings', t => {
  const f = fixture(t);
  const codex = join(f.home, '.codex'); mkdirSync(codex);
  writeFileSync(join(codex, 'config.toml'), 'model = "existing"\n');
  f.install();
  for (const skill of ['rememberme', 'brain-page', 'brain-setup', 'brain-bootstrap', 'brain-ingest']) {
    assert.ok(existsSync(join(codex, 'skills', skill, 'SKILL.md')));
  }
  assert.equal(readFileSync(join(codex, 'config.toml'), 'utf8'), 'model = "existing"\n');
  assert.ok(!existsSync(join(f.project, 'BRAIN.md')));
  assert.ok(!existsSync(join(f.project, '.codex')));
  assert.match(f.brain(['help']), /create-page/);
});

test('memory survives reinit and reinstall; uninstall preserves project pages', t => {
  const f = fixture(t); f.install();
  writeFileSync(join(f.project, 'AGENTS.md'), '# My instructions\nKeep this.\n');
  f.brain(['init']);
  f.brain(['create-page', '--id', 'storage', '--category', 'decision', '--title', 'Use Markdown']);
  f.brain(['update-truth', '--id', 'storage', '--summary', 'Agreed for portability'], 'Use Markdown for durable decisions.\n');
  f.brain(['append-timeline', '--id', 'storage', '--kind', 'evidence', '--summary', 'Verified by integration test']);
  const page = join(f.project, 'brain', 'pages', 'storage.md');
  const before = readFileSync(page, 'utf8');
  assert.match(before, /Agreed for portability/);
  f.install(); f.brain(['init']);
  assert.equal(readFileSync(page, 'utf8'), before);
  assert.match(readFileSync(join(f.project, 'AGENTS.md'), 'utf8'), /Keep this/);
  assert.match(f.brain(['read-page', 'storage']), /durable decisions/);
  f.brain(['lint-links']); f.brain(['uninstall', '-y']);
  assert.equal(readFileSync(page, 'utf8'), before);
  assert.ok(!existsSync(join(f.home, '.codex', 'skills', 'rememberme')));
});

test('honors redirected brain root without creating a shadow brain', t => {
  const f = fixture(t); f.install();
  mkdirSync(join(f.project, '.mindmux'));
  writeFileSync(join(f.project, '.mindmux', 'preferences.json'), JSON.stringify({ brainRoot: 'knowledge' }));
  f.brain(['init']);
  f.brain(['create-page', '--id', 'constraint', '--category', 'concept', '--title', 'Constraint']);
  assert.ok(existsSync(join(f.project, 'knowledge', 'pages', 'constraint.md')));
  assert.ok(!existsSync(join(f.project, 'brain')));
});

test('backs up unrelated existing skills and restores them on uninstall', t => {
  const f = fixture(t);
  const existing = join(f.home, '.codex', 'skills', 'rememberme');
  mkdirSync(existing, { recursive: true });
  writeFileSync(join(existing, 'SKILL.md'), 'My original skill');
  f.install();
  assert.equal(readFileSync(join(existing + '.pre-brain.bak', 'SKILL.md'), 'utf8'), 'My original skill');
  f.brain(['uninstall', '-y']);
  assert.equal(readFileSync(join(existing, 'SKILL.md'), 'utf8'), 'My original skill');
});

test('refuses to overwrite an unrelated brain launcher', t => {
  const f = fixture(t); mkdirSync(join(f.home, 'bin'));
  const launcher = join(f.home, 'bin', 'brain'); writeFileSync(launcher, 'custom launcher');
  const r = spawnSync('bash', [join(repo, 'install-brain.sh')], { env: f.env, encoding: 'utf8' });
  assert.equal(r.status, 1); assert.match(r.stderr, /Refusing/);
  assert.equal(readFileSync(launcher, 'utf8'), 'custom launcher');
});
