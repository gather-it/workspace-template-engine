# workspace-template-engine

Template application and pure workspace configuration transforms.

## Run

Requires Node 24 or later. Prebuilt JavaScript and declarations are included; there are no runtime dependencies.

```sh
node --test test/stages/*.test.mjs
```

To rebuild and typecheck after editing:

```sh
npm ci --ignore-scripts
npm run typecheck
npm run build
npm test
```

Run all named stages with `npm run verify:through`, or the first N with `npm run verify:through -- N`. Stage 15 also packs and installs the artifact into a separate temporary consumer without workspace links or network access.

## Example

```js
import {createCatalog, planTemplates, applyTemplatePlan, nodeFiles} from './dist/index.js';
const fs = nodeFiles();
const root = process.cwd();
const plan = await planTemplates({
  root, sources: [root + '/templates'], files: ['hello.txt'], fs,
  catalog: createCatalog([{file: 'hello.txt', rendered: true}]),
  context: {name: 'reader'},
});
await applyTemplatePlan(plan, {root, fs});
```

## Behavior and boundaries

Supply your own templates. The example expects `templates/_hello.txt` to contain `Hello {{name}}`. Dotfiles use a leading underscore in their source name; other untracked or unspecified templates are prefixed with an underscore. Tracked sources retain their filename.

The built-in renderer supports simple escaped `{{key}}` and raw `{{{key}}}` substitutions. It does not implement sections, partials or the full Mustache language. Supply another renderer when needed. Raw-copy entries do not interpolate. Planning has no write or Git side effects.

Application creates directories, invokes optional tracking hooks, then writes changed content permitted by overwrite policy. Tracking hooks also run for unchanged files. There are no default Git commands, release presets, registry settings or repository templates. Existing destination protection, per-template overwrite, overwrite-all and selected-file overwrite are separate controls.

The Node filesystem adapter checks destination containment including existing symlinked parents. Source directories and templates must be trusted. Callers must prevent concurrent filesystem replacement during apply; these checks are not an operating-system sandbox. Writes are sequential and not transactional: an I/O failure may leave earlier planned files applied. A supplied port may implement stronger atomicity.

Workspace graphs are explicit and reject cycles, duplicate names and missing nodes. TypeScript transforms return copies. Section replacement requires exactly one ordered marker pair and preserves surrounding text. Command rendering is supplied by the caller; no generated build command is executed.

## Verification commands

| Stage | Command |
| --- | --- |
| 1 | `npm run verify:templates:engine-boundary` |
| 2 | `npm run verify:templates:catalog` |
| 3 | `npm run verify:templates:source-names` |
| 4 | `npm run verify:templates:source-precedence` |
| 5 | `npm run verify:templates:render-context` |
| 6 | `npm run verify:templates:render-semantics` |
| 7 | `npm run verify:templates:overwrite-policy` |
| 8 | `npm run verify:templates:change-plan` |
| 9 | `npm run verify:templates:destination-safety` |
| 10 | `npm run verify:templates:tracking-hooks` |
| 11 | `npm run verify:templates:document-merge` |
| 12 | `npm run verify:templates:workspace-graph` |
| 13 | `npm run verify:templates:typescript-references` |
| 14 | `npm run verify:templates:build-sections` |
| 15 | `npm run verify:templates:standalone-release` |

## Implementation status

This is a standalone implementation of the neutral contracts used by this package. Stage tests validate the behavior implemented here. They do not certify an existing application's compatibility adapter, production migration, browser bundle, database integration or rollback. No publishing rights are granted by this distribution. The package is private and unlicensed for redistribution.
