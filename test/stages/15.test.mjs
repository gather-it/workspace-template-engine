import test from 'node:test';
import assert from 'node:assert/strict';
import * as api from '../../dist/index.js';
import * as h from '../helpers.mjs';
test('second application is stable in a clean project',async t=>{const root=h.tree(t,{'sources/_a':'value'}),fs=api.nodeFiles();const options={root,sources:[h.path.join(root,'sources')],files:['a'],catalog:api.createCatalog([{file:'a'}]),fs};await api.applyTemplatePlan(await api.planTemplates(options),{root,fs});const second=await api.planTemplates(options);assert.equal(second[0].changed,false);assert.equal(second[0].write,false)});

test('packed artifact installs offline and runs in a clean consumer', t => h.verifyPacked(t, "import assert from 'node:assert/strict';import {render,dependencyClosure} from 'workspace-template-engine';assert.equal(render('Hello {{name}}',{name:'demo'}),'Hello demo');assert.equal(dependencyClosure([{name:'a',location:'a',kind:'library',dependencies:[]}],'a').length,1);const {execFileSync}=await import('node:child_process');assert.match(execFileSync(process.execPath,['node_modules/workspace-template-engine/dist/cli.js','--help'],{encoding:'utf8'}),/Usage: workspace-templates/);"));
