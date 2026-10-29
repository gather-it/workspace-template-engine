import {dependencyClosure, type Workspace} from './graph.js';
export function replaceSection(contents: string, start: string, end: string, replacement: string): string {
  if (!start || !end || start === end) throw new Error('Invalid section markers');
  const first = contents.indexOf(start); const last = contents.indexOf(end);
  if (first < 0 || last < first + start.length || contents.indexOf(start, first + start.length) !== -1 || contents.indexOf(end, last + end.length) !== -1) throw new Error('Invalid section markers');
  return contents.slice(0, first + start.length) + replacement + contents.slice(last);
}
export function updateBuildSection(contents: string, options: {workspaces: readonly Workspace[]; workspace: string; start: string; end: string; command: (workspace: Workspace) => string}): string {
  const lines = dependencyClosure(options.workspaces, options.workspace).map(options.command);
  return replaceSection(contents, options.start, options.end, lines.join('\n') + '\n');
}
