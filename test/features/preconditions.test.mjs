import test from 'node:test';import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {planTemplates,applyTemplatePlan,createCatalog,nodeFiles} from '../../dist/index.js';
import {tree,path,readFileSync} from '../helpers.mjs';
const options=(root)=>({root,sources:[path.join(root,'templates')],files:['a','b'],catalog:createCatalog([{file:'a'},{file:'b'}]),fs:nodeFiles(),overwriteAll:true});

test('a stale destination rejects the whole preflight before earlier writes or tracking',async t=>{
 const root=tree(t,{'templates/_a':'new-a','templates/_b':'new-b','a':'old-a','b':'old-b'});const opts=options(root);
 const plan=await planTemplates(opts);writeFileSync(path.join(root,'b'),'manual edit');let tracks=0;
 await assert.rejects(applyTemplatePlan(plan,{root,fs:opts.fs,track:()=>{tracks++}}),{code:'stale-plan'});
 assert.equal(readFileSync(path.join(root,'a'),'utf8'),'old-a');assert.equal(tracks,0);
});
test('a file created after planning is protected even with overwrite-all',async t=>{
 const root=tree(t,{'templates/_a':'a','templates/_b':'b'});const opts=options(root);const plan=await planTemplates(opts);
 writeFileSync(path.join(root,'a'),'manual');await assert.rejects(applyTemplatePlan(plan,{root,fs:opts.fs}),{code:'stale-plan'});
 assert.equal(readFileSync(path.join(root,'a'),'utf8'),'manual');
});
test('preconditions are checked again after a tracking callback',async t=>{
 const root=tree(t,{'templates/a':'new','a':'old'});const fs=nodeFiles();const plan=await planTemplates({root,sources:[path.join(root,'templates')],files:['a'],catalog:createCatalog([{file:'a',tracked:true}]),fs,overwriteAll:true});
 await assert.rejects(applyTemplatePlan(plan,{root,fs,track:()=>writeFileSync(path.join(root,'a'),'changed')}),{code:'stale-plan'});
 assert.equal(readFileSync(path.join(root,'a'),'utf8'),'changed');
});
