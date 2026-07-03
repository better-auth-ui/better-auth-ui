# Better Auth UI common task playbooks

Use the smallest playbook that matches the request. Escalate to deeper repo inspection when evidence conflicts.

## Debug auth behavior

1. Decide whether the failure is upstream Better Auth or Better Auth UI.
2. If raw Better Auth client/server calls fail, read upstream Better Auth docs/skills first.
3. If raw Better Auth works but Better Auth UI hooks/components fail, inspect `packages/core` descriptors and framework adapters.
4. Do not patch UI components around missing Better Auth server config, plugins, providers, schemas, or session setup.

## Add or change a query

1. Inspect the existing core query descriptor/key pattern in `packages/core`.
2. Update React and Solid adapters only after the core contract is clear.
3. Add or update docs under both `apps/docs/content/docs/react/queries` and `apps/docs/content/docs/solid/queries` when public.
4. Add parity/export tests when the query becomes public API.

## Add or change a mutation

1. Start from core mutation descriptor, mutation keys, params, and invalidation behavior.
2. Keep React and Solid hooks thin; do not duplicate shared endpoint or key logic.
3. Check plugin variants: api-key, multi-session, organization, passkey, username, magic-link, delete-user.
4. Update docs under React/Solid mutation paths when consumer-facing.

## Update copied UI components

1. Identify the registry surface: shadcn/ui for React or Zaidan for Solid.
2. Inspect the source component, registry docs, and matching example app.
3. Preserve app-owned/copy-paste expectations: avoid package-import assumptions for copied components.
4. Validate the example that owns the affected component.

## Update HeroUI packaged components

1. Inspect `packages/heroui` and the matching HeroUI example.
2. Check public exports and peer dependencies before changing imports.
3. Validate package build and affected example/docs when behavior changes.

## Update docs or llms output

1. Edit source under `apps/docs/content/docs` or route source under `apps/docs/src`.
2. Do not manually edit `apps/docs/dist/client/llms.txt` or `llms-full.txt`.
3. Run docs build and grep generated output for the expected route/text.

## Debug a CI or validation failure

1. Inspect the failing command from the CI log; do not infer the build system.
2. Check `package.json`, lockfiles, and framework config to identify the project's package manager and scripts.
3. Reproduce the failing script locally with non-interactive/static output when the tool supports it.
4. Fix the smallest failing contract, then rerun the focused script and any broader script required by the project.
