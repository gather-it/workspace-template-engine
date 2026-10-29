import type {PlannedFile} from './plan.js';

export type PlanAction = 'create' | 'update' | 'unchanged' | 'protected';
export interface PlanReview {
  files: {file: string; action: PlanAction; beforeBytes: number; afterBytes: number; diff?: string}[];
  counts: Record<PlanAction, number>;
}

/** Contents are included only when a caller explicitly asks for a text preview. */
export function reviewPlan(plan: readonly PlannedFile[], options: {includeDiff?: boolean; maxDiffBytes?: number} = {}): PlanReview {
  const limit = options.maxDiffBytes ?? 8192;
  if (!Number.isInteger(limit) || limit < 1) throw new RangeError('Invalid diff limit');
  const counts: PlanReview['counts'] = {create: 0, update: 0, unchanged: 0, protected: 0};
  const files = plan.map(entry => {
    const action: PlanAction = !entry.changed ? 'unchanged' : !entry.write ? 'protected' : entry.previous === undefined ? 'create' : 'update';
    counts[action]++;
    const item: PlanReview['files'][number] = {file: entry.file, action,
      beforeBytes: Buffer.byteLength(entry.previous ?? ''), afterBytes: Buffer.byteLength(entry.contents)};
    if (options.includeDiff && entry.changed) {
      const before = entry.previous ?? '';
      if (Buffer.byteLength(before) + Buffer.byteLength(entry.contents) > limit) item.diff = 'Preview omitted: size limit';
      else item.diff = ['--- before', '+++ after', ...before.split('\n').map(line => '-' + line), ...entry.contents.split('\n').map(line => '+' + line)].join('\n');
    }
    return item;
  });
  return {files, counts};
}
