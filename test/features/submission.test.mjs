import test from 'node:test';import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';import {spawnSync} from 'node:child_process';

test('manifest and root license agree',()=>{
 const manifest=JSON.parse(readFileSync(new URL('../../package.json',import.meta.url),'utf8'));
 assert.equal(manifest.license,'MIT');assert.ok(manifest.files.includes('LICENSE'));
 assert.match(readFileSync(new URL('../../LICENSE',import.meta.url),'utf8'),/^MIT License/m);
 assert.equal(manifest.bin['workspace-templates'],'dist/cli.js');
});
test('the synthetic CLI demonstration runs and cleans up',()=>{
 const result=spawnSync(process.execPath,['examples/demo.mjs'],{cwd:new URL('../../',import.meta.url),encoding:'utf8',timeout:10000});
 assert.equal(result.status,0,result.stderr);
 assert.equal(result.stdout,'Planned: 1 create\nApplied: greeting.txt\nDrift check: clean\n');
});
