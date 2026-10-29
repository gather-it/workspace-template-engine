import test from 'node:test';
import assert from 'node:assert/strict';
import * as api from '../../dist/index.js';
import * as h from '../helpers.mjs';
test('tracking has three states and occurs before content writes',async t=>{const root=h.tree(t),events=[];const fs={exists:()=>false,read:async()=>'',ensureParent:async()=>events.push('parent'),write:async()=>events.push('write')};await api.applyTemplatePlan([{file:'a',destination:h.path.join(root,'a'),contents:'x',tracked:false,changed:true,write:true}],{root,fs,track:(_f,v)=>events.push(v)});assert.deepEqual(events,['parent',false,'write'])});
