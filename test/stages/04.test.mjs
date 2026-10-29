import test from 'node:test';
import assert from 'node:assert/strict';
import * as api from '../../dist/index.js';
import * as h from '../helpers.mjs';
test('first existing source wins and missing sources return undefined',()=>{assert.equal(api.resolveTemplate({file:'a'},['/first','/second'],p=>p==='/second/_a'),'/second/_a');assert.equal(api.resolveTemplate({file:'a'},['/first'],()=>false),undefined)});
