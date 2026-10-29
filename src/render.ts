export function render(template: string, context: Readonly<Record<string, unknown>>): string {
  const escape = (text: string) => text.replace(/[&<>"']/g, char => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[char]!));
  const get = (key: string) => Object.hasOwn(context, key) ? String(context[key] ?? '') : '';
  const slots: string[] = [];
  const token = '\u0000';
  if (template.includes(token)) throw new Error('Invalid template character');
  return template.replace(/\{\{\{\s*([\w.-]+)\s*\}\}\}/g, (_match, key: string) => {
    slots.push(get(key)); return token + (slots.length - 1) + token;
  }).replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (_match, key: string) => escape(get(key)))
    .replace(/\u0000(\d+)\u0000/g, (_match, index: string) => slots[Number(index)]!);
}
