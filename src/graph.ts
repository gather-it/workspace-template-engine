export interface Workspace {name: string; location: string; kind: 'library' | 'service'; dependencies: readonly string[]; typescript?: boolean}
export function dependencyClosure(workspaces: readonly Workspace[], name: string): Workspace[] {
  const graph = new Map(workspaces.map(node => [node.name, node]));
  if (graph.size !== workspaces.length) throw new Error('Duplicate workspace');
  const active = new Set<string>(); const visited = new Set<string>(); const result: Workspace[] = [];
  function visit(key: string) {
    if (active.has(key)) throw new Error('Workspace cycle');
    if (visited.has(key)) return;
    const node = graph.get(key);
    if (!node) throw new Error('Unknown workspace');
    active.add(key); visited.add(key); result.push(structuredClone(node));
    for (const dependency of node.dependencies) visit(dependency);
    active.delete(key);
  }
  visit(name); return result;
}
