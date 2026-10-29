import path from 'node:path';
import {sourceName, type Template} from './catalog.js';
export function contained(root: string, file: string): string {
  if (path.isAbsolute(file)) throw new Error('Invalid template path');
  const result = path.resolve(root, file);
  const relative = path.relative(path.resolve(root), result);
  if (!relative || relative === '..' || relative.startsWith('..' + path.sep) || path.isAbsolute(relative)) throw new Error('Invalid template path');
  return result;
}
export function resolveTemplate(template: Template, sources: readonly string[], exists: (file: string) => boolean): string | undefined {
  for (const source of sources) { const file = contained(source, sourceName(template)); if (exists(file)) return file; }
  return undefined;
}
