import path from 'node:path';

export interface Workspace {name: string; location: string; kind: 'library' | 'service'; dependencies: readonly string[]; typescript?: boolean}

function workspaceGraph(workspaces: readonly Workspace[]): Map<string, Workspace> {
  const graph = new Map<string, Workspace>();
  const locations = new Set<string>();
  for (const workspace of workspaces) {
    if (!/^(?:@[a-z0-9][a-z0-9._-]*\/)?[a-z0-9][a-z0-9._-]*$/i.test(workspace.name)) throw new Error('Invalid workspace name');
    if (graph.has(workspace.name)) throw new Error('Duplicate workspace');
    const location = path.normalize(workspace.location);
    if (!workspace.location || path.isAbsolute(location) || location === '..' || location.startsWith('..' + path.sep)) throw new Error('Invalid workspace location');
    if (locations.has(location)) throw new Error('Duplicate workspace location');
    if (!['library', 'service'].includes(workspace.kind) || !Array.isArray(workspace.dependencies)) throw new Error('Invalid workspace');
    graph.set(workspace.name, workspace); locations.add(location);
  }
  for (const workspace of workspaces) for (const dependency of workspace.dependencies) if (!graph.has(dependency)) throw new Error('Unknown workspace');
  return graph;
}

/** Stable dependency-first ordering for build and configuration orchestration. */
export function topologicalWorkspaces(workspaces: readonly Workspace[]): Workspace[] {
  const graph = workspaceGraph(workspaces);
  const active = new Set<string>(); const done = new Set<string>(); const result: Workspace[] = [];
  function visit(name: string) {
    if (active.has(name)) throw new Error('Workspace cycle');
    if (done.has(name)) return;
    const workspace = graph.get(name)!;
    active.add(name);
    for (const dependency of workspace.dependencies) visit(dependency);
    active.delete(name); done.add(name); result.push(structuredClone(workspace));
  }
  for (const workspace of workspaces) visit(workspace.name);
  return result;
}

export function validateWorkspaces(workspaces: readonly Workspace[]): void { topologicalWorkspaces(workspaces); }

/** Retains the original root-first closure order for existing consumers. */
export function dependencyClosure(workspaces: readonly Workspace[], name: string): Workspace[] {
  const graph = workspaceGraph(workspaces);
  if (!graph.has(name)) throw new Error('Unknown workspace');
  validateWorkspaces(workspaces);
  const visited = new Set<string>(); const result: Workspace[] = [];
  function visit(key: string) {
    if (visited.has(key)) return;
    visited.add(key);
    const workspace = graph.get(key)!; result.push(structuredClone(workspace));
    for (const dependency of workspace.dependencies) visit(dependency);
  }
  visit(name); return result;
}
