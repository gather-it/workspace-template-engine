import test from 'node:test';import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {planTemplates,applyTemplatePlan,createCatalog,nodeFiles} from '../../dist/index.js';
import {tree,path,readFileSync} from '../helpers.mjs';
const prepare=async root=>{const fs=nodeFiles();const plan=await planTemplates({root,sources:[path.join(root,'templates')],files:['a','b'],catalog:createCatalog([{file:'a'},{file:'b'}]),fs,overwriteAll:true});return {plan,fs}};

test('write failure restores earlier replaced content',async t=>{
 const root=tree(t,{'templates/_a':'newA','templates/_b':'newB','a':'oldA','b':'oldB'});const {plan,fs}=await prepare(root);
 const port={...fs,write:async(file,text)=>{if(file===path.join(root,'b'))throw new Error('write failure');await fs.write(file,text)}};
 await assert.rejects(applyTemplatePlan(plan,{root,fs:port,rollbackOnError:true}),{code:'apply-failed'});
 assert.equal(readFileSync(path.join(root,'a'),'utf8'),'oldA');assert.equal(readFileSync(path.join(root,'b'),'utf8'),'oldB');
});
test('cancellation with rollback removes newly created files',async t=>{
 const root=tree(t,{'templates/_a':'A','templates/_b':'B'});const {plan,fs}=await prepare(root);const controller=new AbortController();const events=[];
 await assert.rejects(applyTemplatePlan(plan,{root,fs,rollbackOnError:true,signal:controller.signal,onEvent:e=>{events.push(e.type);if(e.type==='written')controller.abort()}}),{code:'cancelled'});
 assert.equal(fs.exists(path.join(root,'a')),false);assert.deepEqual(events,['written','rolled-back']);
});
test('recovery does not overwrite a conflicting external edit',async t=>{
 const root=tree(t,{'templates/_a':'newA','templates/_b':'newB','a':'oldA'});const {plan,fs}=await prepare(root);
 const port={...fs,write:async(file,text)=>{if(file===path.join(root,'b')){writeFileSync(path.join(root,'a'),'manual');throw new Error()}await fs.write(file,text)}};
 await assert.rejects(applyTemplatePlan(plan,{root,fs:port,rollbackOnError:true}),{code:'rollback-failed'});
 assert.equal(readFileSync(path.join(root,'a'),'utf8'),'manual');
});
test('an unsupported rollback port fails before writes',async()=>{
 await assert.rejects(applyTemplatePlan([],{root:'.',fs:{},rollbackOnError:true}),{code:'unsupported-rollback'});
 const c=new AbortController();c.abort();await assert.rejects(applyTemplatePlan([],{root:'.',fs:{},signal:c.signal}),{code:'cancelled'});
});
