import test from 'node:test';import assert from 'node:assert/strict';
import {updateTypeScript} from '../../dist/index.js';import {graph} from '../helpers.mjs';
const configs=()=>Object.fromEntries(graph.map(w=>[w.name,{compilerOptions:{strict:true,paths:{custom:['src/custom'],c:['handwritten/c']}}}]));

test('merge preserves handwritten aliases, root files and external references without mutating inputs',()=>{
 const input=configs();const root={files:['bootstrap.ts'],references:[{path:'external'},{path:'apps/app'}]};
 const out=updateTypeScript(graph,root,input,{paths:'merge',references:'merge',conflicts:'existing'});
 assert.deepEqual(out.workspaces.app.compilerOptions.paths.custom,['src/custom']);
 assert.deepEqual(out.workspaces.app.compilerOptions.paths.c,['handwritten/c']);
 assert.deepEqual(out.root.files,['bootstrap.ts']);assert.equal(out.root.references.length,5);
 assert.equal(root.references.length,2);assert.deepEqual(input.app.compilerOptions.paths.c,['handwritten/c']);
});
test('conflicts can reject the transform or prefer generated mappings',()=>{
 assert.throws(()=>updateTypeScript(graph,{},configs(),{paths:'merge',conflicts:'error'}),/conflict/);
 const out=updateTypeScript(graph,{},configs(),{paths:'merge',conflicts:'generated'});
 assert.deepEqual(out.workspaces.app.compilerOptions.paths.c,['node_modules/c/dist','node_modules/c/src']);
});
test('default replacement semantics remain unchanged',()=>{
 const out=updateTypeScript(graph,{files:['bootstrap.ts'],references:[{path:'external'}]},configs());
 assert.deepEqual(out.root.files,[]);assert.equal(out.root.references.length,4);
 assert.equal(out.workspaces.app.compilerOptions.paths.custom,undefined);assert.equal(out.workspaces.app.compilerOptions.strict,true);
});
