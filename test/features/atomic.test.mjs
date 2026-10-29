import test from 'node:test';import assert from 'node:assert/strict';
import {chmodSync,statSync,readdirSync,mkdirSync,symlinkSync} from 'node:fs';
import {atomicWrite,nodeFiles} from '../../dist/index.js';
import {tree,path,readFileSync} from '../helpers.mjs';

test('atomic replacement retains permissions and complete contents',async t=>{
 const root=tree(t,{'a':'old'}),file=path.join(root,'a');chmodSync(file,0o640);
 await atomicWrite(file,'new\n'.repeat(2000));assert.equal(readFileSync(file,'utf8'),'new\n'.repeat(2000));
 assert.equal(statSync(file).mode&0o777,0o640);assert.deepEqual(readdirSync(root),['a']);
});
test('failed rename cleans its temporary file and retains the destination directory',async t=>{
 const root=tree(t,{'a/marker':'keep'});await assert.rejects(atomicWrite(path.join(root,'a'),'new'));
 assert.deepEqual(readdirSync(root),['a']);assert.equal(readFileSync(path.join(root,'a/marker'),'utf8'),'keep');
});
test('new files are private and final symlinks are rejected instead of replaced',async t=>{
 const root=tree(t,{'target':'old'});await nodeFiles().write(path.join(root,'new'),'value');
 assert.equal(statSync(path.join(root,'new')).mode&0o777,0o600);
 symlinkSync(path.join(root,'target'),path.join(root,'alias'));await assert.rejects(atomicWrite(path.join(root,'alias'),'replacement'));
 assert.equal(readFileSync(path.join(root,'target'),'utf8'),'old');assert.equal(statSync(path.join(root,'alias')).isFile(),true);
});
