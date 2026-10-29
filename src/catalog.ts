export interface Template {file: string; rendered?: boolean; overwrite?: boolean; tracked?: boolean}
export function createCatalog(entries: readonly Template[]): ReadonlyMap<string, Readonly<Template>> {
  const catalog = new Map<string, Readonly<Template>>();
  for (const entry of entries) {
    if (!entry.file || catalog.has(entry.file)) throw new Error('Invalid template catalog');
    catalog.set(entry.file, Object.freeze({...entry}));
  }
  return catalog;
}
export function sourceName(template: Template): string {
  if (template.file.startsWith('.')) return '_' + template.file.slice(1);
  return template.tracked ? template.file : '_' + template.file;
}
