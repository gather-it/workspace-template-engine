# Contributing

Use Node 24 or later. Install with `npm ci --ignore-scripts`, run `npm run check`, and use `npm run demo` for the synthetic example. No external service or credentials are needed.

For an application failure, report the source and destination states, overwrite policy and which operation failed. Use a temporary directory or an injected file port in regression tests. Test failures before and after a write, cancellation, and conflicting user edits when touching recovery behavior.

Keep existing exports and defaults working unless the migration is documented with the change. Land complete changes with cumulative tests. Build output and development dependencies are ignored by Git. Type fixtures in `test/types` validate the public declarations.

Use synthetic fixtures. Never commit tokens, private endpoints, keys or personal/customer data. Environment files and private key files are ignored. Revoke and remove any accidentally committed credential before publishing the history.

Preserve real commits. Do not backdate work, invent adoption, or present same-day preparation as a long maintenance history. Use an email linked to your GitHub account, such as its noreply address. Follow ROADMAP.md for work still planned.
