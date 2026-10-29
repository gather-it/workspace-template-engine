import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
const scripts = Object.keys(JSON.parse(readFileSync(new URL('../package.json', import.meta.url))).scripts)
  .filter(key => key.startsWith('verify:') && key !== 'verify:through');
const through = process.argv[2] === undefined ? scripts.length : Number(process.argv[2]);
if (!Number.isInteger(through) || through < 1 || through > scripts.length) throw new Error('Invalid stage');
for (const name of scripts.slice(0, through)) {
  const result = spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', name], {stdio: 'inherit'});
  if (result.status !== 0) process.exit(result.status ?? 1);
}
