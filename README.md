# workspace-template-engine

A TypeScript library and CLI for reviewing workspace template changes before writing them.

This is for developers maintaining generated text files across a workspace: shared configuration, project scaffolding and small documentation sections. It separates source selection, rendering, planning and application so callers can inspect a change, reject a stale plan and recover file contents after a failed run. There are no runtime dependencies.

**Status:** early prototype. Evidence currently consists of synthetic examples, automated tests and local package-install checks. No production adoption, published release or longer maintenance history is claimed. The [roadmap](ROADMAP.md) describes 35 estimated hours of future work.

## Run locally

Use Node 24 or later with npm:

```sh
npm ci --ignore-scripts
npm run check
npm run demo
```

The demonstration uses a temporary directory and synthetic templates. It makes no network requests and removes its output afterward:

```text
Planned: 1 create
Applied: greeting.txt
Drift check: clean
```

Development dependencies are TypeScript and the Node type declarations. Tests use Node's built-in runner. The complete check covers the source, typed consumer examples, runtime tests and an offline installation of a locally packed artifact, including its CLI entry.

## Use the CLI

After building, create a project containing a `templates` directory and this `workspace.json`:

```json
{
  "sources": ["templates"],
  "templates": [{"file": "greeting.txt", "rendered": true}],
  "context": {"project": {"name": "sample workspace"}},
  "strict": true,
  "rollbackOnError": true
}
```

Put `Hello {{project.name}}!` in `templates/_greeting.txt`. With the built CLI path in place of `path/to`, run:

```sh
node path/to/dist/cli.js plan workspace.json
node path/to/dist/cli.js check workspace.json
node path/to/dist/cli.js apply workspace.json
```

The installed executable is `workspace-templates`. The npm package remains marked private to avoid accidental registry publication during development; local tarball installation works.

| Command | Result |
| --- | --- |
| `plan` | Prints action counts and filenames without writing or printing file contents. |
| `check` | Prints the same summary; exits 2 for any content drift, including protected files, or 0 when clean. |
| `apply` | Plans and applies explicitly, returning written and skipped filenames as JSON. |

Errors exit 1 with a fixed message. Cancellation exits 130 when detected. `--help` exits 0. Root and source paths resolve relative to the configuration file, not the terminal's current directory. The output root must already exist. Unknown configuration fields are rejected to catch typos.

The optional fields are `root`, `overwriteAll`, `missing` (`error` or `skip`), `strict`, `maxOutputBytes` and `rollbackOnError`. There are no Git commands or external processes hidden in template application.

## Library example

```js
import {createCatalog, nodeFiles, planTemplates, reviewPlan, applyTemplatePlan}
  from './dist/index.js';

const fs = nodeFiles();
const root = process.cwd();
const plan = await planTemplates({
  root, sources: [root + '/templates'], fs,
  files: ['greeting.txt'],
  catalog: createCatalog([{file: 'greeting.txt', rendered: true}]),
  context: {project: {name: 'sample workspace'}},
  renderOptions: {missing: 'error'},
});

console.log(reviewPlan(plan));
const result = await applyTemplatePlan(plan, {root, fs, rollbackOnError: true});
console.log(result);
```

`reviewPlan(plan, {includeDiff: true})` adds a bounded whole-file text preview. Contents are otherwise omitted. A preview is for human review, not a patch file. See [the typed example](examples/typed-plan.ts) for checked options and results.

## Behavior

- The first source containing a template wins. Source dotfiles use a leading underscore; other untracked or unspecified sources are prefixed with an underscore. A tracked source keeps its filename.
- The renderer supports escaped `{{key}}` and raw `{{{key}}}` values, including nested own properties. An explicit dotted key wins over nested lookup. Inserted values are never interpreted as template syntax. Sections and partials are not supported; callers may supply another renderer.
- Existing files are protected unless a template or caller enables overwrite. Byte-identical output is not rewritten. Optional tracking hooks still run for unchanged entries, preserving the original API contract.
- Plans record destination fingerprints. A changed, created or deleted destination invalidates the recorded plan. Replan instead of forcing an old plan through. Hand-built legacy plans without fingerprints cannot provide this protection.
- The Node adapter validates canonical source roots, rejects symbolic destinations and replaces each file with a same-directory rename. Existing permission bits are retained; new files use mode 0600. Custom file ports must supply equivalent guarantees if needed.
- Cancellation is checked at planning and application boundaries. A write already in progress may finish. The default retains completed writes; optional rollback restores their prior contents or removes newly created files.
- Rollback refuses to overwrite a conflicting external edit. It does not undo Git hooks, restore every metadata field, remove newly created empty directories or provide crash recovery. It requires a port with `remove` and writes that either complete or leave recoverable contents.

These checks do not make template execution a sandbox. Prevent concurrent filesystem replacement during application and use trusted template sources and custom hooks. A stale check and a rename are not a filesystem-wide transaction.

## Workspace transforms

`dependencyClosure` preserves root-first traversal. `topologicalWorkspaces` gives a stable dependency-first order. Graph validation rejects duplicate identities or locations, outside-root locations, missing dependencies and cycles, including disconnected cycles.

`updateTypeScript` returns copies of root and workspace configurations. Defaults retain replacement semantics. Pass `{paths: 'merge', references: 'merge', conflicts: 'existing'}` to preserve handwritten aliases and references; conflict handling can instead prefer generated values or reject the transform. Marked-section transforms preserve surrounding text and reject missing, reversed or repeated markers. They produce text and never execute build commands.

## Development

```sh
npm run typecheck
npm run typecheck:examples
npm test
npm run verify:through
```

Feature-specific verification scripts live in `package.json`. The original fifteen groups remain, followed by the added capability groups. Their count is independent of Git commit count. CI runs `npm run check` on Node 24 once the repository is hosted on GitHub.

Read [the design notes](docs/design.md), [contribution guide](CONTRIBUTING.md), [development record](DEVELOPMENT.md) and [roadmap](ROADMAP.md). Report actual adoption when it exists; the included demonstration is not production-use evidence.

## License

[MIT](LICENSE).
