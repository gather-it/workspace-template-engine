import path from 'node:path';
import {promises as fs, existsSync, realpathSync} from 'node:fs';
import type {FilePort, PlannedFile} from './plan.js';
import {contained} from './resolve.js';
export async function applyTemplatePlan(plan: readonly PlannedFile[], options: {
  root: string; fs: FilePort; track?: (file: string, tracked: boolean) => void | Promise<void>;
}) {
  // Preflight all destinations before any side effects. Callers must prevent concurrent filesystem changes.
  try {
    for (const file of plan) {
      if (contained(options.root, file.file) !== path.resolve(file.destination)) throw new Error();
      await options.fs.validate?.(options.root, file.destination);
    }
    for (const file of plan) {
      await options.fs.validate?.(options.root, file.destination);
      await options.fs.ensureParent(file.destination);
      if (file.tracked !== undefined) await options.track?.(file.destination, file.tracked);
      if (file.write) await options.fs.write(file.destination, file.contents);
    }
  } catch { throw new Error('Template application failed'); }
}
export function nodeFiles(): FilePort {
  return {
    exists: existsSync, read: file => fs.readFile(file, 'utf8'),
    write: async (file, contents) => { await fs.writeFile(file, contents); },
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
