import test from 'node:test';
import assert from 'node:assert/strict';
import * as api from '../../dist/index.js';
import * as h from '../helpers.mjs';
test('section enrichment preserves manual content and is idempotent',()=>{const old='manual\nBEGIN\nold\nEND\nfooter';const next=api.replaceSection(old,'BEGIN\n','END\n','new\n');assert.equal(next,'manual\nBEGIN\nnew\nEND\nfooter');assert.equal(api.replaceSection(next,'BEGIN\n','END\n','new\n'),next)});
