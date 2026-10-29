import {createCatalog, nodeFiles, planTemplates, reviewPlan, applyTemplatePlan, type PlanOptions, type ApplyOptions} from '../src/index.js';

export async function generate(root: string, sources: readonly string[]) {
  const fs=nodeFiles();
  const options: PlanOptions={root,sources,fs,files:['greeting.txt'],
    catalog:createCatalog([{file:'greeting.txt',rendered:true}]),
    context:{project:{name:'sample'}},renderOptions:{missing:'error'}};
  const plan=await planTemplates(options);
  const summary=reviewPlan(plan);
  const apply: ApplyOptions={root,fs,rollbackOnError:true};
  const result=await applyTemplatePlan(plan,apply);
  return {summary,result};
}
