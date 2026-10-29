import test from 'node:test';
import assert from 'node:assert/strict';
import * as api from '../../dist/index.js';
import * as h from '../helpers.mjs';
test('dependency closure handles diamonds and rejects cycles or missing nodes',()=>{assert.deepEqual(api.dependencyClosure(h.graph,'app').map(x=>x.name),['app','a','c','b']);assert.throws(()=>api.dependencyClosure([{name:'a',location:'a',kind:'library',dependencies:['a']}],'a'),/cycle/);assert.throws(()=>api.dependencyClosure(h.graph,'missing'),/Unknown/)});
