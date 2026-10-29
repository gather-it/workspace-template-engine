# Development record

This repository began with the complete existing standalone prototype, recorded as one baseline commit. Subsequent commits implemented and tested actual changes. The work was recorded on 29 October 2026; it is not evidence of months of maintenance or production adoption.

The development sequence is:

1. Record the existing template prototype and its current tests.
2. Add read-only action summaries and bounded text previews.
3. Record destination state and reject stale plans.
4. Replace individual files atomically, retaining permission bits and cleaning temporary paths.
5. Add cancellation boundaries, isolated events and structured results.
6. Add optional conflict-aware rollback of file contents.
7. Validate workspace graphs and expose dependency-first ordering.
8. Add explicit policies for merging TypeScript mappings and references.
9. Validate canonical template sources and reject symbolic destinations.
10. Add strict nested rendering with one-pass substitution.
11. Add a validated plan, drift-check and apply CLI.
12. Prepare the license, executable examples, typed fixtures, CI and project documentation.

The first item preserved an existing prototype rather than claiming it was newly implemented in that commit. The earlier tests passed before preservation. Each subsequent implementation commit passed a build and the cumulative runtime tests before being committed. The final preparation also checks examples and public type assertions.

The original numbered verification groups describe test organization, not separate historical releases. No commit timestamp has been backdated, and no release or deployed user is claimed. Further work should continue on this history rather than replacing it with another upload.
