import test from 'node:test';
import assert from 'node:assert/strict';
import * as api from '../../dist/index.js';
import * as h from '../helpers.mjs';
test('source names preserve packaging conventions',()=>{assert.equal(api.sourceName({file:'.config'}),'_config');assert.equal(api.sourceName({file:'plain'}),'_plain');assert.equal(api.sourceName({file:'plain',tracked:true}),'plain')});
