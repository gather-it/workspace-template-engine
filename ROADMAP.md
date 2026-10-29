# Roadmap

The next milestone improves recovery, platform support and practical template management. The fifteen items below are all pending and total **35 estimated engineering hours**. They are future work, separate from the completed preparation in DEVELOPMENT.md. Estimates include implementation, review and acceptance tests and may change with evidence.

Land each item as a usable change. Preserve existing defaults, run current checks and earlier acceptance tests, and keep the project working if development stops partway through. Add each proposed verification script when its tests exist; the names below are not empty package-script placeholders.

## 1 On-disk recovery journal

**Estimate: 3 hours. Status: pending.**

- Record an opt-in versioned content journal before writes and add an explicit recovery command.
- Document the public contract and preserve earlier behavior through tests.

**Verification — proposed `verify:templates:recovery-journal`:** Kill a test subprocess after its first replacement. Expect recoverable old content, validated journal paths and no replay over a conflicting user edit.

## 2 Workspace writer lock

**Estimate: 3 hours. Status: pending.**

- Add a cross-process advisory lock with explicit ownership, timeout and stale-lock handling.
- Document the public contract and preserve earlier behavior through tests.

**Verification — proposed `verify:templates:writer-lock`:** Start two apply processes against one root. Expect serialized writers or a documented timeout, with no silent takeover of a live lock.

## 3 Windows and macOS filesystem matrix

**Estimate: 3 hours. Status: pending.**

- Exercise replacement, symlinks, permissions and cancellation on additional supported operating systems.
- Document the public contract and preserve earlier behavior through tests.

**Verification — proposed `verify:templates:platform-matrix`:** Run the same conformance suite on each declared platform. Expect matching content behavior and documented platform-specific permission limitations.

## 4 Structured JSON merge

**Estimate: 2 hours. Status: pending.**

- Add a pure JSON transform with explicit array and key-conflict policies.
- Document the public contract and preserve earlier behavior through tests.

**Verification — proposed `verify:templates:json-merge`:** Merge nested objects and conflicting arrays. Expect the selected policy, unchanged inputs and no application after a rejected transform.

## 5 JSONC comment preservation

**Estimate: 2 hours. Status: pending.**

- Support a separate comment-aware configuration transform without changing raw text behavior.
- Document the public contract and preserve earlier behavior through tests.

**Verification — proposed `verify:templates:jsonc-preservation`:** Edit a JSONC fixture containing comments and trailing commas. Expect the requested fields to change and unrelated comments to remain.

## 6 Line endings and encoding

**Estimate: 2 hours. Status: pending.**

- Make newline preservation and supported text encodings explicit per template.
- Document the public contract and preserve earlier behavior through tests.

**Verification — proposed `verify:templates:text-encoding`:** Regenerate LF and CRLF fixtures, including a byte-order mark. Expect documented output bytes and a clean second application.

## 7 Binary asset templates

**Estimate: 3 hours. Status: pending.**

- Introduce byte-oriented template entries while keeping text rendering separate.
- Document the public contract and preserve earlier behavior through tests.

**Verification — proposed `verify:templates:binary-assets`:** Copy an invented binary fixture, cancel a later write and recover the earlier asset. Expect exact bytes and no accidental text decoding.

## 8 Persisted reviewable plans

**Estimate: 3 hours. Status: pending.**

- Define a versioned plan format with content digests and strict validation for later application.
- Document the public contract and preserve earlier behavior through tests.

**Verification — proposed `verify:templates:persisted-plan`:** Save, reload and tamper with plans. Expect unsupported versions and edited destinations to be rejected before writes.

## 9 Template selection filters

**Estimate: 2 hours. Status: pending.**

- Add predictable include and exclude selection for large catalogs with portable path normalization.
- Document the public contract and preserve earlier behavior through tests.

**Verification — proposed `verify:templates:selection-filters`:** Select overlapping groups and exclude nested paths. Expect deterministic ordering and no duplicate planned destinations.

## 10 Context schema validation

**Estimate: 2 hours. Status: pending.**

- Let template packs declare required values and simple scalar constraints before rendering.
- Document the public contract and preserve earlier behavior through tests.

**Verification — proposed `verify:templates:context-schema`:** Supply missing and invalid synthetic context. Expect a safe validation result and zero destination writes.

## 11 Local template pack manifests

**Estimate: 2 hours. Status: pending.**

- Load versioned local catalogs with explicit source roots and no executable configuration.
- Document the public contract and preserve earlier behavior through tests.

**Verification — proposed `verify:templates:pack-manifest`:** Load two pack versions and malformed manifests. Expect clear compatibility rules, declared roots and no implicit code execution.

## 12 Bounded concurrent planning

**Estimate: 2 hours. Status: pending.**

- Allow limited parallel reads and rendering while keeping plan ordering and application serial.
- Document the public contract and preserve earlier behavior through tests.

**Verification — proposed `verify:templates:planning-concurrency`:** Use delayed fake reads with cancellation. Expect the configured concurrency ceiling, stable output order and no write during planning.

## 13 Failure sequence coverage

**Estimate: 2 hours. Status: pending.**

- Add reproducible operation sequences covering write, cancellation, rollback and observer behavior.
- Document the public contract and preserve earlier behavior through tests.

**Verification — proposed `verify:templates:failure-sequences`:** Compare final filesystem state against a small reference model after each sequence. Expect reproducible failures and no hidden partial state.

## 14 Executable API recipes and coverage

**Estimate: 2 hours. Status: pending.**

- Add tested recipes for custom file ports, safe tracking hooks and configuration transforms, with a focused coverage report.
- Document the public contract and preserve earlier behavior through tests.

**Verification — proposed `verify:templates:api-recipes`:** Compile and run each recipe. Expect documented results and meaningful error-path assertions rather than a coverage percentage alone.

## 15 Release and previous-consumer checks

**Estimate: 2 hours. Status: pending.**

- Prepare a release candidate and a compatibility fixture for an earlier library consumer and CLI config.
- Document the public contract and preserve earlier behavior through tests.

**Verification — proposed `verify:templates:release-consumers`:** Install the tarball in clean consumers. Expect a working CLI, valid types and license, no undeclared dependencies and documented version changes.
