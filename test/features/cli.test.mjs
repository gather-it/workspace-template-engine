import test from 'node:test';import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';import {existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';import {tree,path,readFileSync} from '../helpers.mjs';
const cli=fileURLToPath(new URL('../../dist/cli.js',import.meta.url));
const run=(command,file)=>spawnSync(process.execPath,[cli,command,file],{encoding:'utf8',timeout:10000});

test('CLI plan and check are read-only; apply is explicit and idempotent',t=>{
 const config={sources:['templates'],templates:[{file:'hello.txt',rendered:true}],context:{project:{name:'demo'}},strict:true,rollbackOnError:true};
 const root=tree(t,{'config.json':JSON.stringify(config),'templates/_hello.txt':'Hello {{project.name}}'});const file=path.join(root,'config.json');
 const preview=run('plan',file);assert.equal(preview.status,0,preview.stderr);assert.equal(JSON.parse(preview.stdout).counts.create,1);
 assert.equal(existsSync(path.join(root,'hello.txt')),false);assert.equal(run('check',file).status,2);
 const apply=run('apply',file);assert.equal(apply.status,0,apply.stderr);assert.deepEqual(JSON.parse(apply.stdout).written,['hello.txt']);
 assert.equal(readFileSync(path.join(root,'hello.txt'),'utf8'),'Hello demo');assert.equal(run('check',file).status,0);
 assert.deepEqual(JSON.parse(run('apply',file).stdout).written,[]);
});
test('CLI errors do not expose input contents or filesystem paths',t=>{
 const root=tree(t,{'private-sentinel.json':'private-sentinel'});const result=run('apply',path.join(root,'private-sentinel.json'));
 assert.equal(result.status,1);assert.equal(result.stderr,'Template command failed.\n');assert.equal(result.stderr.includes(root),false);
});
test('CLI rejects ambiguous configuration instead of silently ignoring typos',t=>{
 const root=tree(t,{'config.json':JSON.stringify({sources:['templates'],templates:[{file:'a'}],overwriteAl:true}),'templates/_a':'x'});
 const result=run('apply',path.join(root,'config.json'));assert.equal(result.status,1);assert.equal(existsSync(path.join(root,'a')),false);
});
