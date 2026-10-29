import test from 'node:test';import assert from 'node:assert/strict';
import {planTemplates,applyTemplatePlan,createCatalog,nodeFiles} from '../../dist/index.js';
import {tree,path,readFileSync} from '../helpers.mjs';
const prepare=async root=>{const fs=nodeFiles();const plan=await planTemplates({root,sources:[path.join(root,'templates')],files:['a','b'],catalog:createCatalog([{file:'a'},{file:'b'}]),fs});return {plan,fs}};

test('pre-cancelled planning does no filesystem read',async()=>{
 const controller=new AbortController();controller.abort();let reads=0;
 await assert.rejects(planTemplates({root:'.',sources:[],files:[],catalog:new Map(),signal:controller.signal,fs:{exists:()=>{reads++;return false}}}),{code:'cancelled'});assert.equal(reads,0);
});
test('cancelling after a file commits stops later writes without undoing that file',async t=>{
 const root=tree(t,{'templates/_a':'A','templates/_b':'B'});const {plan,fs}=await prepare(root);const controller=new AbortController();const events=[];
 await assert.rejects(applyTemplatePlan(plan,{root,fs,signal:controller.signal,onEvent:event=>{events.push(event);controller.abort()}}),{code:'cancelled'});
 assert.equal(readFileSync(path.join(root,'a'),'utf8'),'A');assert.equal(fs.exists(path.join(root,'b')),false);
 assert.deepEqual(events,[{type:'written',file:'a'}]);
});
test('application reports written and skipped files despite observer exceptions',async t=>{
 const root=tree(t,{'templates/_a':'A','templates/_b':'B','b':'B'});const {plan,fs}=await prepare(root);
 const result=await applyTemplatePlan(plan,{root,fs,onEvent:()=>{throw new Error('observer')}});
 assert.deepEqual(result,{written:['a'],skipped:['b']});
});
