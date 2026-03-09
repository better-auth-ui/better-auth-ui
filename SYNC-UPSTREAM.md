# Weekly Upstream Sync

**Goal:** Sync `olliethedev/better-auth-ui` (`@btst/better-auth-ui`) with upstream `better-auth-ui/better-auth-ui`, update `@btst/stack` to the latest version from `/Users/ollie/Work/better-stack/packages/stack/`, resolve any issues, and bump our package version.

---

## Context

- **Our fork:** `@btst/better-auth-ui` at `git@github.com:olliethedev/better-auth-ui.git`
- **Upstream:** `https://github.com/better-auth-ui/better-auth-ui` — tracked as `upstream/main` remote (already configured)
- **Our custom commits** add the btst plugin layer: `src/plugins/`, `src/lib/plugin-context-bridge.tsx`, `src/client.ts`, `src/components/*/pages/` wrappers, and our `package.json` branding
- **btst/stack source** is at `/Users/ollie/Work/better-stack/packages/stack/` — check `package.json` there for the current version

---

## Steps

1. **Fetch upstream**
   ```bash
   git fetch upstream/main
   ```
   Remote `upstream/main` is already configured.

2. **Check what's new**
   ```bash
   git log --oneline HEAD ^upstream/main      # our commits
   git log --oneline upstream/main ^HEAD      # upstream commits we're missing
   ```
   Note any new view paths, components, or types added upstream.

3. **Merge upstream**
   ```bash
   git merge upstream/main
   ```
   The **only expected conflict** is `package.json`. Resolve it by keeping our branding (`@btst/better-auth-ui`, `version`, `homepage`, `repository`, `@btst/stack` peer dep, `@btst/yar` peer dep) while taking upstream's updated dep versions.

4. **Regenerate lockfile**
   ```bash
   git checkout upstream/main -- pnpm-lock.yaml
   pnpm install --no-frozen-lockfile
   ```

5. **Check for new view paths**
   Compare `src/lib/view-paths.ts` against the previous sync. If upstream added new entries to `authViewPaths`, `accountViewPaths`, or `organizationViewPaths`, each new path needs:
   - A new `*-page.tsx` + `*-page.internal.tsx` pair under the appropriate `src/components/*/pages/` directory (copy the pattern from any existing pair)
   - A new route entry in the corresponding plugin (`src/plugins/auth-plugin.ts`, `account-plugin.ts`, or `organization-plugin.ts`)
   - If it introduces a new option type (like `TeamOptions` was added in March 2026), import and expose it in the plugin overrides interface and pass it through `src/lib/plugin-context-bridge.tsx`

6. **Check for new context props**
   Diff `src/lib/auth-ui-provider.tsx` against the previous sync. Any new props added to `AuthUIProviderProps` or `AuthUIContextType` need to be wired up in `src/lib/plugin-context-bridge.tsx`.

7. **Update `@btst/stack` peer dep**
   ```bash
   cat /Users/ollie/Work/better-stack/packages/stack/package.json | grep '"version"'
   ```
   Update the `@btst/stack` peer dep range in `package.json` to `>=<new-version>`.

8. **Bump our version**
   Increment `version` in `package.json`:
   - **Minor bump** (e.g. `1.2.0` → `1.3.0`) for new routes or btst additions
   - **Patch bump** (e.g. `1.2.0` → `1.2.1`) for a pure upstream sync with no new btst additions

9. **Build and verify**
   ```bash
   npx turbo build
   ```
   Must succeed with no errors.

10. **Format**
    ```bash
    npx biome check --fix
    ```

11. **Commit**
    ```bash
    git add -A
    git commit -m "chore: sync upstream vX.X.X + bump btst to X.X.X"
    ```

---

## Caveats & Pro-tips

- **`pnpm-lock.yaml` always conflicts** — take upstream's version first (`git checkout upstream/main -- pnpm-lock.yaml`), then regenerate with `pnpm install --no-frozen-lockfile`.

- **Our plugin files never conflict with upstream** — `src/plugins/`, `src/components/*/pages/`, `src/lib/plugin-context-bridge.tsx`, and `src/client.ts` don't exist in upstream, so git will never touch them during a merge.

- **New view paths are the main thing to watch for** — every new entry in `view-paths.ts` represents a page users can navigate to. If you don't expose it as a btst route, it's silently inaccessible in btst apps. Always diff `src/lib/view-paths.ts` carefully.

- **New localization keys are safe to ignore** — they come in automatically via the merge and the bridge already passes `localization` through.

- **The `biome` `any` warnings in `plugin-context-bridge.tsx` are pre-existing and intentional** — don't spend time fixing them.

- **Work on a branch, not `main` directly** — use `chore/sync-upstream-<date>`, verify the build, then PR to `main`.
