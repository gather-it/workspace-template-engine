import test from 'node:test';
import assert from 'node:assert/strict';
import * as api from '../../dist/index.js';
import * as h from '../helpers.mjs';
test('destination validation blocks traversal and symlink escape before writes',async t=>{const root=h.tree(t,{'sources/_a':'x'}),outside=h.tree(t);h.symlinkSync(outside,h.path.join(root,'link'));assert.throws(()=>api.contained(root,'../outside'),/Invalid/);await assert.rejects(api.nodeFiles().validate(root,h.path.join(root,'link/a')));let writes=0;await assert.rejects(api.applyTemplatePlan([{file:'../escape',destination:h.path.join(root,'../escape'),contents:'x',write:true,changed:true}],{root,fs:{...api.nodeFiles(),write:async()=>{writes++}}}));assert.equal(writes,0)});
