export interface RenderOptions {missing?: 'empty' | 'error'; maxOutputBytes?: number}
export function render(template: string, context: Readonly<Record<string, unknown>>, options: RenderOptions = {}): string {
  if (!['empty','error'].includes(options.missing ?? 'empty') || (options.maxOutputBytes !== undefined && (!Number.isInteger(options.maxOutputBytes) || options.maxOutputBytes < 0))) throw new Error('Invalid render policy');
  const escape = (text: string) => text.replace(/[&<>"']/g, char => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[char]!));
  const get = (key: string): string => {
    let value: unknown = context;
    if (Object.hasOwn(context,key)) value = context[key];
    else for (const part of key.split('.')) {
      if (!value || typeof value !== 'object' || !Object.hasOwn(value,part)) { value = undefined; break; }
      value = (value as Record<string,unknown>)[part];
    }
    if (value === undefined && options.missing === 'error') throw new Error('Missing template value');
    return String(value ?? '');
  };
  // One replacement pass: inserted values are never interpreted as template syntax.
  const result = template.replace(/\{\{\{\s*([\w.-]+)\s*\}\}\}|\{\{\s*([\w.-]+)\s*\}\}/g,
    (_match, raw: string | undefined, escaped: string | undefined) => raw !== undefined ? get(raw) : escape(get(escaped!)));
  if (options.maxOutputBytes !== undefined && Buffer.byteLength(result) > options.maxOutputBytes) throw new Error('Rendered output exceeds limit');
  return result;
}
