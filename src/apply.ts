import path from 'node:path';
import {promises as fs, existsSync, realpathSync} from 'node:fs';
import type {FilePort, PlannedFile} from './plan.js';
import {contained} from './resolve.js';
import {assertPlanCurrent} from './preconditions.js';
import {TemplateError,checkAbort} from './errors.js';
import {atomicWrite} from './atomic.js';
export interface ApplyEvent {type: 'written' | 'skipped' | 'rolled-back'; file: string}
export interface ApplyResult {written: string[]; skipped: string[]}
export interface ApplyOptions {
  root: string; fs: FilePort; track?: (file: string, tracked: boolean) => void | Promise<void>;
  signal?: AbortSignal; onEvent?: (event: ApplyEvent) => void;
  rollbackOnError?: boolean;
}
export async function applyTemplatePlan(plan: readonly PlannedFile[], options: ApplyOptions): Promise<ApplyResult> {
  const result: ApplyResult = {written: [], skipped: []};
  const journal: {file: PlannedFile; previous?: string}[] = [];
  const emit = (event: ApplyEvent) => { try { options.onEvent?.(Object.freeze({...event})); } catch { /* Observation is isolated. */ } };
  // Preflight all destinations before any side effects. Callers must prevent concurrent filesystem changes.
  try {
    checkAbort(options.signal);
    if (options.rollbackOnError && !options.fs.remove) throw new TemplateError('unsupported-rollback');
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
        if (options.rollbackOnError) journal.push({file, previous: options.fs.exists(file.destination) ? await options.fs.read(file.destination) : undefined});
        await options.fs.write(file.destination, file.contents);
        result.written.push(file.file); emit({type: 'written', file: file.file});
      } else { result.skipped.push(file.file); emit({type: 'skipped', file: file.file}); }
    }
    return result;
  } catch (error) {
    let rollbackFailed = false;
    for (const entry of journal.reverse()) {
      try {
        await options.fs.validate?.(options.root, entry.file.destination);
        const exists = options.fs.exists(entry.file.destination);
        const current = exists ? await options.fs.read(entry.file.destination) : undefined;
        if (current === entry.previous) continue;
        // Refuse to replace a third party's edit while attempting recovery.
        if (current !== entry.file.contents) throw new Error('Rollback conflict');
        if (entry.previous === undefined) await options.fs.remove!(entry.file.destination);
        else await options.fs.write(entry.file.destination, entry.previous);
        emit({type: 'rolled-back', file: entry.file.file});
      } catch { rollbackFailed = true; }
    }
    if (rollbackFailed) throw new TemplateError('rollback-failed');
    if (error instanceof TemplateError) throw error;
    throw new TemplateError('apply-failed');
  }
}
export function nodeFiles(): FilePort {
  return {
    exists: existsSync, read: file => fs.readFile(file, 'utf8'),
    write: atomicWrite,
    remove: async file => { await fs.rm(file, {force: true}); },
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
