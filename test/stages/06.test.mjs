import test from 'node:test';
import assert from 'node:assert/strict';
import * as api from '../../dist/index.js';
import * as h from '../helpers.mjs';
test('render handles escaping, raw slots and Unicode',()=>{assert.equal(api.render('{{value}} {{{value}}}',{value:'<é>&'}),'&lt;é&gt;&amp; <é>&');assert.equal(api.render('{{{value}}}',{value:'{{unchanged}}'}),'{{unchanged}}')});
