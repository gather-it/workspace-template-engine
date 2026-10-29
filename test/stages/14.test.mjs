import test from 'node:test';
import assert from 'node:assert/strict';
import * as api from '../../dist/index.js';
import * as h from '../helpers.mjs';
test('generated build section deduplicates dependencies and rejects malformed markers',()=>{const opts={workspaces:h.graph,workspace:'app',start:'START\n',end:'END\n',command:w=>'COPY '+w.location};const text=api.updateBuildSection('before\nSTART\nold\nEND\nafter',opts);assert.equal(text.split('COPY packages/c').length-1,1);assert.equal(api.updateBuildSection(text,opts),text);assert.throws(()=>api.replaceSection('START\nSTART\nEND\n','START\n','END\n',''),/Invalid/)});
