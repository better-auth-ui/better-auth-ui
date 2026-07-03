# Better Auth UI agent checklist

Use this checklist before editing and before returning results.

## Before editing

- [ ] Identified the active surface: core, React, Solid, shadcn/ui, HeroUI, or Zaidan.
- [ ] Read the matching docs from `https://better-auth-ui.com/llms.txt` or local docs source.
- [ ] Checked whether the behavior belongs to upstream Better Auth before changing Better Auth UI.
- [ ] Checked whether the behavior belongs in `packages/core` before changing framework adapters.
- [ ] Confirmed React and Solid APIs are not being mechanically mixed.
- [ ] Confirmed copied registry components are not treated like packaged components.
- [ ] Confirmed generated `dist` or `llms` output will not be edited manually.

## While editing

- [ ] Keep adapters thin and framework-specific.
- [ ] Preserve existing public exports unless intentionally changing API.
- [ ] Add or update JSDoc for consumer-facing hooks, options, and helpers.
- [ ] Update React and Solid docs together when a shared public API changes.
- [ ] Add tests for export boundaries, parity, or behavior when public contracts change.

## Before responding

- [ ] Ran the narrowest relevant validation using the consumer project's own scripts/tooling.
- [ ] Ran docs validation if docs or llms-facing content changed.
- [ ] Reported commands exactly, including failures or skipped checks.
- [ ] Mentioned unresolved framework/docs ambiguity instead of guessing.
- [ ] Kept generated artifacts and local agent noise out of staged changes.
