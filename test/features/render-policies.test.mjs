import test from 'node:test';import assert from 'node:assert/strict';
import {render,planTemplates,createCatalog,nodeFiles} from '../../dist/index.js';import {tree,path} from '../helpers.mjs';

test('nested own properties resolve while literal dotted keys retain precedence',()=>{
 assert.equal(render('{{project.name}} {{enabled}} {{count}}',{project:{name:'demo'},enabled:false,count:0},{missing:'error'}),'demo false 0');
 assert.equal(render('{{project.name}}',{'project.name':'literal',project:{name:'nested'}}),'literal');
 const context={project:Object.create({name:'inherited'})};assert.throws(()=>render('{{project.name}}',context,{missing:'error'}),/Missing/);
});
test('inserted braces and null bytes are data and cannot invoke another substitution',()=>{
 assert.equal(render('{{{raw}}} {{escaped}}',{raw:'{{secret}}',escaped:'\u00000\u0000',secret:'hidden'}),'{{secret}} \u00000\u0000');
 assert.equal(render('{{value}} {{{value}}}',{value:'<tag>'}),'&lt;tag&gt; <tag>');
 assert.throws(()=>render('{{value}}',{value:'éé'},{maxOutputBytes:3}),/limit/);
});
test('strict rendering rejects incomplete plans without writing any files',async t=>{
 const root=tree(t,{'templates/_a':'{{project.name}}'});const fs=nodeFiles();
 await assert.rejects(planTemplates({root,sources:[path.join(root,'templates')],files:['a'],catalog:createCatalog([{file:'a',rendered:true}]),fs,context:{},renderOptions:{missing:'error'}}),/planning failed/);
 assert.equal(fs.exists(path.join(root,'a')),false);
});
