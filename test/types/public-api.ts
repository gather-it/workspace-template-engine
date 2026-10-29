import type {ApplyOptions,PlanOptions,PlanReview,ApplyResult,RenderOptions} from '../../src/index.js';
declare const options: ApplyOptions;
declare const plan: PlanOptions;
declare const review: PlanReview;
declare const result: ApplyResult;
const rollback: boolean | undefined=options.rollbackOnError;
const rendered: RenderOptions | undefined=plan.renderOptions;
const action: 'create' | 'update' | 'unchanged' | 'protected'=review.files[0]!.action;
const written: string[]=result.written;
void [rollback,rendered,action,written];
// @ts-expect-error Rollback is a boolean option, not a string configuration.
const invalid: ApplyOptions={root:'.',fs:options.fs,rollbackOnError:'yes'};
// @ts-expect-error Missing-value policy has a defined vocabulary.
const wrongRender: RenderOptions={missing:'ignore'};
void [invalid,wrongRender];
