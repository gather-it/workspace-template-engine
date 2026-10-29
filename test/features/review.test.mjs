import test from 'node:test';
import assert from 'node:assert/strict';
import {reviewPlan, planTemplates, createCatalog, nodeFiles} from '../../dist/index.js';
import {tree,path} from '../helpers.mjs';

test('review distinguishes creates, updates, protected files and unchanged files without leaking content', () => {
  const entries = [
    {file:'a',contents:'secret-sentinel',changed:true,write:true},
    {file:'b',previous:'old',contents:'new',changed:true,write:true},
    {file:'c',previous:'old',contents:'new',changed:true,write:false},
    {file:'d',previous:'same',contents:'same',changed:false,write:false},
  ];
  const review = reviewPlan(entries);
  assert.deepEqual(review.counts,{create:1,update:1,protected:1,unchanged:1});
  assert.equal(JSON.stringify(review).includes('secret-sentinel'),false);
  assert.equal(review.files[0].afterBytes,15);
  assert.equal(reviewPlan(entries,{includeDiff:true,maxDiffBytes:1}).files[0].diff,'Preview omitted: size limit');
});

test('a text preview can be reviewed without writing the destination',async t => {
  const root=tree(t,{'templates/_a':'new\ntext','a':'old'});
  const fs=nodeFiles();let writes=0;
  const plan=await planTemplates({root,sources:[path.join(root,'templates')],files:['a'],catalog:createCatalog([{file:'a'}]),fs:{...fs,write:async()=>{writes++}},overwriteAll:true});
  const review=reviewPlan(plan,{includeDiff:true});
  assert.equal(review.files[0].action,'update');assert.match(review.files[0].diff,/-old/);assert.match(review.files[0].diff,/\+new/);assert.equal(writes,0);
});
