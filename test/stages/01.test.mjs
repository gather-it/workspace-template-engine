import test from 'node:test';
import assert from 'node:assert/strict';
import * as api from '../../dist/index.js';
import * as h from '../helpers.mjs';
test('explicit templates plan and apply without ambient metadata',async t=>{const root=h.tree(t,{'sources/_hello.txt':'Hello {{name}}'});const fs=api.nodeFiles();const plan=await api.planTemplates({root,sources:[h.path.join(root,'sources')],files:['hello.txt'],catalog:api.createCatalog([{file:'hello.txt',rendered:true}]),context:{name:'reader'},fs});await api.applyTemplatePlan(plan,{root,fs});assert.equal(h.readFileSync(h.path.join(root,'hello.txt'),'utf8'),'Hello reader')});
