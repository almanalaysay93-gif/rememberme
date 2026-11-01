// Copy the toolchain so moving the source checkout won't break `brain`.
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

if (process.argv.length > 2) {
  console.error('Usage: bash install-brain.sh (run brain init separately per project)');
  process.exit(2);
}
if (Number(process.versions.node.split('.')[0]) < 18) {
  console.error('Rememberme brain memory requires Node.js 18+.');
  process.exit(1);
}
const source = dirname(dirname(fileURLToPath(import.meta.url)));
const target = join(homedir(), '.local', 'share', 'rememberme', 'brain-md');
const bin = join(homedir(), 'bin');
const wrapper = join(bin, 'brain');
const marker = '# rememberme brain launcher';
if (existsSync(wrapper) && !readFileSync(wrapper, 'utf8').includes(marker)) {
  console.error(`Refusing to replace an unrelated launcher: ${wrapper}`);
  process.exit(1);
}
mkdirSync(target, { recursive: true });
cpSync(join(source, 'vendor', 'brain-md'), target, { recursive: true });
const skill = join(target, 'skills', 'rememberme');
mkdirSync(skill, { recursive: true });
cpSync(join(source, 'SKILL.md'), join(skill, 'SKILL.md'));
const runtimes = ['.claude', '.codex', '.config/opencode', '.cursor', '.pi/agent'];
if (!runtimes.some(p => existsSync(join(homedir(), p)))) {
  mkdirSync(join(homedir(), '.codex'), { recursive: true });
}
const setup = spawnSync(process.execPath, [join(target, 'bin', 'brain.mjs'), 'setup', '-y'], { stdio: 'inherit' });
if (setup.error) throw setup.error;
if (setup.status !== 0) process.exit(setup.status ?? 1);
mkdirSync(bin, { recursive: true });
const quote = value => "'" + value.replaceAll("'", "'\\''") + "'";
writeFileSync(wrapper, `#!/bin/sh\n${marker}\nexec ${quote(process.execPath)} ${quote(join(target, 'bin', 'brain.mjs'))} "$@"\n`, { mode: 0o755 });
console.log(`Rememberme installed. Add ${bin} to PATH if needed.`);
console.log('In each project: brain init, then use the rememberme / brain-bootstrap skills.');
console.log('No project memory, lifecycle hooks, or shell profiles were changed.');
