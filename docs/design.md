# Planning and application design

A catalog selects source naming and per-file behavior. The planner resolves sources, optionally renders them, transforms their contents and records the destination state. It performs reads and validation but has no write or Git effects.

## Review and preconditions

Each planned entry contains proposed text and the destination's prior content and digest. Reviews expose filenames, byte counts and actions by default. An explicit option includes bounded text previews. These reviews are informational; applying uses the full in-memory plan.

Application validates all destinations and their preconditions before side effects, then checks again near each write. This catches ordinary edits between review and application. It cannot exclude another process changing a file between a check and rename, so callers must coordinate concurrent writers.

## Writes and recovery

The Node adapter writes a unique file in the destination directory, flushes and closes it, then renames it over the destination. Failure cleans up the temporary path. This protects one file from partial replacement; it does not make a set of files atomic or guarantee crash durability across directories.

With rollback enabled, a journal records text before each attempted write. On failure or cancellation it walks backward. A file still matching the proposed output can be restored or removed; a conflicting edit is left in place and produces `rollback-failed`. Recovery tries remaining journal entries even if one restoration fails. Tracking hooks and directory creation are outside content rollback.

Cancellation is cooperative at boundaries. Event observers are isolated from control flow. Public application errors have safe categories, while arbitrary port or hook exceptions are replaced with a fixed error. Custom ports can expose different write guarantees and must document them.

## Graphs and configuration

Workspace identity and locations are explicit. Root-first closure remains compatible with the prototype. Dependency-first ordering is separate and deterministic. All components are validated before transformation, including disconnected components.

TypeScript transformation is pure. Replacing mappings is the default; merging requires a declared conflict policy. References are deduplicated by normalized path when preserving existing entries. No database, network client or application-specific workspace field is required.

## CLI

The CLI reads a declarative JSON configuration, validates fields and resolves paths from the config directory. Plan and check do not apply. Apply creates a fresh plan and invokes the library. The renderer, filesystem port and lifecycle hooks remain library extension points; the CLI does not load executable plugins.

The on-disk recovery journal, cross-process lock, binary templates and persisted-plan format in ROADMAP.md are not implemented.
