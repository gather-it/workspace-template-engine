import {mkdtemp, mkdir, readFile, writeFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {runCli} from '../dist/cli.js';

const root=await mkdtemp(path.join(tmpdir(),'workspace-demo-'));
try {
  await mkdir(path.join(root,'templates'));
  await writeFile(path.join(root,'templates/_greeting.txt'),await readFile(new URL('./templates/_greeting.txt',import.meta.url)));
  const config=path.join(root,'workspace.json');
  await writeFile(config,await readFile(new URL('./workspace.json',import.meta.url)));
  async function run(command) {
    let output='';
    const code=await runCli([command,config],{out:text=>{output+=text},error:()=>{}});
    if (code !== 0) throw new Error('Demo command failed');
    return JSON.parse(output);
  }
  const preview=await run('plan');console.log(`Planned: ${preview.counts.create} create`);
  const applied=await run('apply');console.log(`Applied: ${applied.written.join(', ')}`);
  await run('check');console.log('Drift check: clean');
} finally {await rm(root,{recursive:true,force:true})}
