import test from 'node:test';
import assert from 'node:assert/strict';
import * as api from '../../dist/index.js';
import * as h from '../helpers.mjs';
test('unchanged plans skip content writes but preserve tracking hooks',async t=>{const root=h.tree(t,{'sources/a':'same','a':'same'}),fs=api.nodeFiles(),calls=[];const plan=await api.planTemplates({root,sources:[h.path.join(root,'sources')],files:['a'],catalog:api.createCatalog([{file:'a',tracked:true}]),fs});await api.applyTemplatePlan(plan,{root,fs:{...fs,write:async()=>{throw new Error('unexpected')}},track:(_p,v)=>calls.push(v)});assert.equal(plan[0].changed,false);assert.deepEqual(calls,[true])});
