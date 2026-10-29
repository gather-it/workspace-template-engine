import test from 'node:test';import assert from 'node:assert/strict';
import {topologicalWorkspaces,validateWorkspaces,dependencyClosure} from '../../dist/index.js';
import {graph} from '../helpers.mjs';

test('build order is deterministic and places shared dependencies before dependants',()=>{
 const ordered=topologicalWorkspaces(graph);assert.deepEqual(ordered.map(x=>x.name),['c','a','b','app']);
 assert.deepEqual(dependencyClosure(graph,'app').map(x=>x.name),['app','a','c','b']);
 ordered[0].dependencies.push('changed');assert.deepEqual(graph[3].dependencies,[]);
});
test('all components are validated, including disconnected cycles',()=>{
 assert.throws(()=>validateWorkspaces([...graph,{name:'z',location:'z',kind:'library',dependencies:['z']}]),/cycle/);
 assert.throws(()=>validateWorkspaces([...graph,{name:'z',location:'packages/a',kind:'library',dependencies:[]}]),/location/);
 assert.throws(()=>validateWorkspaces([{name:'z',location:'../outside',kind:'library',dependencies:[]}]),/location/);
 assert.throws(()=>validateWorkspaces([{name:'z',location:'z',kind:'library',dependencies:['missing']}]),/Unknown/);
});
test('scoped package names and disconnected acyclic roots are supported',()=>{
 const roots=[{name:'@demo/core',location:'packages/core',kind:'library',dependencies:[]},{name:'cli',location:'apps/cli',kind:'service',dependencies:[]}];
 assert.deepEqual(topologicalWorkspaces(roots).map(x=>x.name),['@demo/core','cli']);
});
