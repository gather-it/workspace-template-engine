import test from 'node:test';
import assert from 'node:assert/strict';
import * as api from '../../dist/index.js';
import * as h from '../helpers.mjs';
test('overwrite flags protect existing files and target selection',async t=>{const root=h.tree(t,{'sources/_a':'new','a':'old'}),fs=api.nodeFiles();const base={root,sources:[h.path.join(root,'sources')],files:['a'],catalog:api.createCatalog([{file:'a'}]),fs};assert.equal((await api.planTemplates(base))[0].write,false);assert.equal((await api.planTemplates({...base,overwriteAll:true}))[0].write,true);assert.deepEqual(await api.planTemplates({...base,overwrite:'other'}),[])});
