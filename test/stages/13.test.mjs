import test from 'node:test';
import assert from 'node:assert/strict';
import * as api from '../../dist/index.js';
import * as h from '../helpers.mjs';
test('TypeScript transforms preserve unrelated settings and source objects',()=>{const configs=Object.fromEntries(h.graph.map(w=>[w.name,{compilerOptions:{strict:true}}]));const result=api.updateTypeScript(h.graph,{compilerOptions:{strict:true}},configs);assert.equal(result.root.references.length,4);assert.equal(result.workspaces.app.compilerOptions.strict,true);assert.deepEqual(result.workspaces.app.compilerOptions.paths.c,['node_modules/c/dist','node_modules/c/src']);assert.equal(configs.app.compilerOptions.paths,undefined)});
