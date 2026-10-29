import path from 'node:path';
import {promises as fs, existsSync, realpathSync} from 'node:fs';
import type {FilePort, PlannedFile} from './plan.js';
import {contained} from './resolve.js';
import {assertPlanCurrent} from './preconditions.js';
import {TemplateError,checkAbort} from './errors.js';
import {atomicWrite} from './atomic.js';
export interface ApplyEvent {type: 'written' | 'skipped'; file: string}
export interface ApplyResult {written: string[]; skipped: string[]}
export interface ApplyOptions {
  root: string; fs: FilePort; track?: (file: string, tracked: boolean) => void | Promise<void>;
  signal?: AbortSignal; onEvent?: (event: ApplyEvent) => void;
}
export async function applyTemplatePlan(plan: readonly PlannedFile[], options: ApplyOptions): Promise<ApplyResult> {
  const result: ApplyResult = {written: [], skipped: []};
  const emit = (event: ApplyEvent) => { try { options.onEvent?.(Object.freeze({...event})); } catch { /* Observation is isolated. */ } };
  // Preflight all destinations before any side effects. Callers must prevent concurrent filesystem changes.
  try {
    for (const file of plan) {
      checkAbort(options.signal);
      if (contained(options.root, file.file) !== path.resolve(file.destination)) throw new Error();
      await options.fs.validate?.(options.root, file.destination);
      await assertPlanCurrent(file, options.fs);
    }
    for (const file of plan) {
      checkAbort(options.signal);
      await options.fs.validate?.(options.root, file.destination);
      await options.fs.ensureParent(file.destination);
      if (file.tracked !== undefined) await options.track?.(file.destination, file.tracked);
      checkAbort(options.signal);
      await assertPlanCurrent(file, options.fs);
      if (file.write) {
        await options.fs.write(file.destination, file.contents);
        result.written.push(file.file); emit({type: 'written', file: file.file});
      } else { result.skipped.push(file.file); emit({type: 'skipped', file: file.file}); }
    }
    return result;
  } catch (error) { if (error instanceof TemplateError) throw error; throw new TemplateError('apply-failed'); }
}
export function nodeFiles(): FilePort {
  return {
    exists: existsSync, read: file => fs.readFile(file, 'utf8'),
    write: atomicWrite,
    ensureParent: async file => { await fs.mkdir(path.dirname(file), {recursive: true}); },
    async validate(root, file) {
      const canonicalRoot = realpathSync(root);
      contained(root, path.relative(root, file));
      let current = file;
      while (!existsSync(current)) { const parent = path.dirname(current); if (parent === current) throw new Error('Invalid root'); current = parent; }
      const relative = path.relative(canonicalRoot, realpathSync(current));
      if (relative === '..' || relative.startsWith('..' + path.sep) || path.isAbsolute(relative)) throw new Error('Destination outside root');
    },
  };
}
