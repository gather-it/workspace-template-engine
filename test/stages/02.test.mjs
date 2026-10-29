import test from 'node:test';
import assert from 'node:assert/strict';
import * as api from '../../dist/index.js';
import * as h from '../helpers.mjs';
test('catalog validates entries and copies caller data',()=>{const entry={file:'one',tracked:true},catalog=api.createCatalog([entry]);entry.tracked=false;assert.equal(catalog.get('one').tracked,true);assert.throws(()=>api.createCatalog([{file:'one'},{file:'one'}]),/Invalid/)});
