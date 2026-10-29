import {type Template} from './catalog.js';
import {resolveTemplate, contained} from './resolve.js';
import {render} from './render.js';
import {contentDigest} from './preconditions.js';
export interface FilePort {exists(file: string): boolean; read(file: string): Promise<string>; write(file: string, contents: string): Promise<void>; ensureParent(file: string): Promise<void>; validate?(root: string, file: string): Promise<void>}
export interface PlannedFile {file: string; destination: string; contents: string; previous?: string; before?: {exists: boolean; digest?: string}; tracked?: boolean; changed: boolean; write: boolean}
export interface PlanOptions {
  root: string; sources: readonly string[]; catalog: ReadonlyMap<string, Readonly<Template>>; files: readonly string[];
  fs: FilePort; context?: Readonly<Record<string, unknown>>; overwriteAll?: boolean; overwrite?: string;
  render?: (template: string, context: Readonly<Record<string, unknown>>) => string | Promise<string>;
  transform?: (file: string, next: string, previous: string | undefined) => string | Promise<string>;
  missing?: 'skip' | 'error';
}
export async function planTemplates(options: PlanOptions): Promise<PlannedFile[]> {
  const result: PlannedFile[] = [];
  try {
    for (const file of [...new Set(options.files)]) {
      if (options.overwrite && options.overwrite !== file) continue;
      const template = options.catalog.get(file);
      if (!template) throw new Error();
      const source = resolveTemplate(template, options.sources, options.fs.exists);
      if (!source) { if (options.missing === 'skip') continue; throw new Error(); }
      const destination = contained(options.root, file);
      await options.fs.validate?.(options.root, destination);
      const previous = options.fs.exists(destination) ? await options.fs.read(destination) : undefined;
      let contents = await options.fs.read(source);
      if (template.rendered) contents = await (options.render ?? render)(contents, options.context ?? {});
      if (options.transform) contents = await options.transform(file, contents, previous);
      result.push({file, destination, contents, previous, before: {exists: previous !== undefined, digest: previous === undefined ? undefined : contentDigest(previous)}, tracked: template.tracked, changed: contents !== previous,
        write: contents !== previous && (previous === undefined || !!template.overwrite || !!options.overwriteAll || !!options.overwrite)});
    }
  } catch { throw new Error('Template planning failed'); }
  return result;
}
