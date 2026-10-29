import test from 'node:test';import assert from 'node:assert/strict';
import {symlinkSync} from 'node:fs';
import {planTemplates,applyTemplatePlan,createCatalog,nodeFiles} from '../../dist/index.js';
import {tree,path,readFileSync} from '../helpers.mjs';
const opts=root=>({root,sources:[path.join(root,'templates')],files:['a'],catalog:createCatalog([{file:'a'}]),fs:nodeFiles()});

test('source symlinks outside the selected root are rejected before reading',async t=>{
 const root=tree(t,{'templates/placeholder':''}),outside=tree(t,{'private':'sentinel'});symlinkSync(path.join(outside,'private'),path.join(root,'templates/_a'));
 let reads=0;const fs=nodeFiles();await assert.rejects(planTemplates({...opts(root),fs:{...fs,read:async file=>{reads++;return fs.read(file)}}}),/planning failed/);assert.equal(reads,0);
});
test('source aliases inside a selected root remain supported',async t=>{
 const root=tree(t,{'templates/value':'safe'});symlinkSync(path.join(root,'templates/value'),path.join(root,'templates/_a'));
 const options=opts(root),plan=await planTemplates(options);await applyTemplatePlan(plan,{root,fs:options.fs});assert.equal(readFileSync(path.join(root,'a'),'utf8'),'safe');
});
test('symbolic destinations are refused during preflight without changing their targets',async t=>{
 const root=tree(t,{'templates/_a':'new','target':'keep'});symlinkSync(path.join(root,'target'),path.join(root,'a'));
 await assert.rejects(planTemplates({...opts(root),overwriteAll:true}),/planning failed/);assert.equal(readFileSync(path.join(root,'target'),'utf8'),'keep');
});
