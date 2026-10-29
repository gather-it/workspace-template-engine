import {dependencyClosure, type Workspace} from './graph.js';
export interface TypeScriptConfig {compilerOptions?: Record<string, unknown>; references?: {path: string}[]; files?: string[]; [key: string]: unknown}
export function updateTypeScript(workspaces: readonly Workspace[], rootConfig: TypeScriptConfig, configs: Readonly<Record<string, TypeScriptConfig>>) {
  const root = structuredClone(rootConfig);
  root.files = []; root.references = [];
  const output: Record<string, TypeScriptConfig> = {};
  for (const workspace of workspaces) {
    if (!workspace.typescript || !configs[workspace.name]) continue;
    root.references.push({path: workspace.location});
    const config = structuredClone(configs[workspace.name]!);
    const paths: Record<string, string[]> = {};
    for (const dependency of dependencyClosure(workspaces, workspace.name).slice(1)) {
      if (!dependency.typescript) continue;
      paths[dependency.name] = [`node_modules/${dependency.name}/dist`, `node_modules/${dependency.name}/src`];
      paths[dependency.name + '/dist/*'] = [`node_modules/${dependency.name}/dist/*`, `node_modules/${dependency.name}/src/*`];
    }
    config.compilerOptions = {...config.compilerOptions, baseUrl: '.', paths};
    output[workspace.name] = config;
  }
  return {root, workspaces: output};
}
