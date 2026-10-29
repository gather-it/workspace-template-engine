import {dependencyClosure, validateWorkspaces, type Workspace} from './graph.js';
import path from 'node:path';
export interface TypeScriptConfig {compilerOptions?: Record<string, unknown>; references?: {path: string}[]; files?: string[]; [key: string]: unknown}
export interface TypeScriptMergeOptions {paths?: 'replace' | 'merge'; conflicts?: 'generated' | 'existing' | 'error'; references?: 'replace' | 'merge'}
export function updateTypeScript(workspaces: readonly Workspace[], rootConfig: TypeScriptConfig, configs: Readonly<Record<string, TypeScriptConfig>>, options: TypeScriptMergeOptions = {}) {
  validateWorkspaces(workspaces);
  if (!['replace','merge'].includes(options.paths ?? 'replace') || !['replace','merge'].includes(options.references ?? 'replace') || !['generated','existing','error'].includes(options.conflicts ?? 'generated')) throw new Error('Invalid merge policy');
  const root = structuredClone(rootConfig);
  root.files = options.references === 'merge' ? root.files ?? [] : [];
  root.references = options.references === 'merge' ? root.references ?? [] : [];
  const referenced = new Set(root.references.map(reference => path.normalize(reference.path)));
  const output: Record<string, TypeScriptConfig> = {};
  for (const workspace of workspaces) {
    if (!workspace.typescript || !configs[workspace.name]) continue;
    if (!referenced.has(path.normalize(workspace.location))) {
      root.references.push({path: workspace.location}); referenced.add(path.normalize(workspace.location));
    }
    const config = structuredClone(configs[workspace.name]!);
    const paths: Record<string, string[]> = {};
    for (const dependency of dependencyClosure(workspaces, workspace.name).slice(1)) {
      if (!dependency.typescript) continue;
      paths[dependency.name] = [`node_modules/${dependency.name}/dist`, `node_modules/${dependency.name}/src`];
      paths[dependency.name + '/dist/*'] = [`node_modules/${dependency.name}/dist/*`, `node_modules/${dependency.name}/src/*`];
    }
    if (options.paths === 'merge') {
      const existing = config.compilerOptions?.paths ?? {};
      if (!existing || typeof existing !== 'object' || Array.isArray(existing)) throw new Error('Invalid existing paths');
      const merged: Record<string,string[]> = {};
      for (const [key,value] of Object.entries(existing)) {
        if (!Array.isArray(value) || !value.every(item => typeof item === 'string')) throw new Error('Invalid existing paths');
        merged[key] = [...value];
      }
      for (const [key,value] of Object.entries(paths)) {
        if (Object.hasOwn(merged,key) && JSON.stringify(merged[key]) !== JSON.stringify(value)) {
          if (options.conflicts === 'error') throw new Error('TypeScript path conflict');
          if (options.conflicts === 'existing') continue;
        }
        merged[key] = value;
      }
      config.compilerOptions = {...config.compilerOptions,baseUrl:'.',paths:merged};
    } else config.compilerOptions = {...config.compilerOptions, baseUrl: '.', paths};
    output[workspace.name] = config;
  }
  return {root, workspaces: output};
}
