import test from 'node:test';
import assert from 'node:assert/strict';
import * as api from '../../dist/index.js';
import * as h from '../helpers.mjs';
test('render context comes only from explicit values',()=>{assert.equal(api.render('{{name}} {{missing}}',{name:'demo'}),'demo ');assert.equal(api.render('{{constructor}}',{}),'')});
