import {createHash} from 'node:crypto';
import type {FilePort, PlannedFile} from './plan.js';
import {TemplateError} from './errors.js';

export const contentDigest = (contents: string): string => createHash('sha256').update(contents).digest('hex');

export async function assertPlanCurrent(file: PlannedFile, fs: FilePort): Promise<void> {
  if (!file.before) return; // Hand-built legacy plans have no recorded precondition.
  const exists = fs.exists(file.destination);
  if (exists !== file.before.exists) throw new TemplateError('stale-plan');
  if (exists && contentDigest(await fs.read(file.destination)) !== file.before.digest) throw new TemplateError('stale-plan');
}
