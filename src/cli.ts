#!/usr/bin/env node
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {createCatalog, type Template} from './catalog.js';
import {planTemplates} from './plan.js';
import {applyTemplatePlan, nodeFiles} from './apply.js';
import {reviewPlan} from './review.js';

interface Configuration {
  root?: string; sources: string[]; templates: Template[]; context?: Record<string, unknown>;
  overwriteAll?: boolean; missing?: 'skip' | 'error'; strict?: boolean;
  maxOutputBytes?: number; rollbackOnError?: boolean;
}

function configuration(value: unknown): Configuration {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid configuration');
  const candidate = value as Record<string,unknown>;
  const accepted = ['root','sources','templates','context','overwriteAll','missing','strict','maxOutputBytes','rollbackOnError'];
  if (Object.keys(candidate).some(key=>!accepted.includes(key))) throw new Error('Unknown configuration field');
  if (candidate.root !== undefined && typeof candidate.root !== 'string') throw new Error('Invalid root');
  if (!Array.isArray(candidate.sources) || !candidate.sources.length || !candidate.sources.every(item=>typeof item === 'string' && item)) throw new Error('Invalid sources');
  if (!Array.isArray(candidate.templates) || !candidate.templates.length) throw new Error('Invalid templates');
  for (const item of candidate.templates) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) throw new Error('Invalid template');
    const template = item as Record<string,unknown>;
    if (typeof template.file !== 'string' || !template.file || Object.keys(template).some(key=>!['file','rendered','overwrite','tracked'].includes(key))) throw new Error('Invalid template');
    for (const flag of ['rendered','overwrite','tracked']) if (template[flag] !== undefined && typeof template[flag] !== 'boolean') throw new Error('Invalid template flag');
  }
  if (candidate.context !== undefined && (!candidate.context || typeof candidate.context !== 'object' || Array.isArray(candidate.context))) throw new Error('Invalid context');
  for (const flag of ['overwriteAll','strict','rollbackOnError']) if (candidate[flag] !== undefined && typeof candidate[flag] !== 'boolean') throw new Error('Invalid flag');
  if (candidate.missing !== undefined && !['error','skip'].includes(String(candidate.missing))) throw new Error('Invalid missing policy');
  if (candidate.maxOutputBytes !== undefined && (typeof candidate.maxOutputBytes !== 'number' || !Number.isInteger(candidate.maxOutputBytes) || candidate.maxOutputBytes < 0)) throw new Error('Invalid output limit');
  return candidate as unknown as Configuration;
}

export async function runCli(args: readonly string[], io: {out?: (text: string)=>void; error?: (text: string)=>void; signal?: AbortSignal} = {}): Promise<number> {
  const out = io.out ?? (text=>process.stdout.write(text));
  const error = io.error ?? (text=>process.stderr.write(text));
  if (args.length === 1 && args[0] === '--help') { out('Usage: workspace-templates <plan|check|apply> <config.json>\n'); return 0; }
  try {
    if (args.length !== 2 || !['plan','check','apply'].includes(args[0]!)) throw new Error('Invalid command');
    const configFile = path.resolve(args[1]!);
    const config = configuration(JSON.parse(await readFile(configFile,'utf8')));
    const directory = path.dirname(configFile);
    const root = path.resolve(directory,config.root ?? '.');
    const fs = nodeFiles();
    const plan = await planTemplates({root,fs,files:config.templates.map(template=>template.file),
      catalog:createCatalog(config.templates),sources:config.sources.map(source=>path.resolve(directory,source)),
      context:config.context,overwriteAll:config.overwriteAll,missing:config.missing,signal:io.signal,
      renderOptions:{missing:config.strict ? 'error' : 'empty',maxOutputBytes:config.maxOutputBytes}});
    if (args[0] === 'apply') {
      out(JSON.stringify(await applyTemplatePlan(plan,{root,fs,signal:io.signal,rollbackOnError:config.rollbackOnError}))+'\n'); return 0;
    }
    out(JSON.stringify(reviewPlan(plan))+'\n');
    return args[0] === 'check' && plan.some(file=>file.changed) ? 2 : 0;
  } catch { error('Template command failed.\n'); return io.signal?.aborted ? 130 : 1; }
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  const controller = new AbortController();
  const cancel = () => controller.abort();
  process.once('SIGINT',cancel); process.once('SIGTERM',cancel);
  runCli(process.argv.slice(2),{signal:controller.signal}).then(code=>{process.exitCode=code;}).finally(()=>{
    process.removeListener('SIGINT',cancel);process.removeListener('SIGTERM',cancel);
  });
}
