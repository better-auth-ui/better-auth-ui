# Better Auth UI validation strategy

Do not assume a consumer project uses any specific package manager, monorepo runner, framework, test runner, or formatter. Detect the local toolchain first, then run the narrowest relevant command.

## Detect the project toolchain

Check, in order:

1. `package.json` scripts and dependencies.
2. Lockfiles: `bun.lock`, `pnpm-lock.yaml`, `yarn.lock`, `package-lock.json`.
3. Framework config: Next.js, TanStack Start, Vite, Solid, React, Storybook, or test runner config.
4. Existing CI workflow commands.

Use the package manager already present in the project.

## Consumer project validation

Prefer available scripts over invented commands:

```bash
<pkg-manager> install
<pkg-manager> run typecheck
<pkg-manager> run lint
<pkg-manager> run test
<pkg-manager> run build
```

If a script is missing, do not add tooling just for validation. Report the missing script and run the closest existing check.

## Registry/copied component validation

After installing shadcn/ui or Zaidan copied components:

1. Run the consumer app's typecheck or build script.
2. Run the consumer app's formatter/linter if present.
3. Smoke-test the route or component that imports the copied files.

## Package integration validation

After changing package imports or setup:

1. Confirm the package is installed with the project's package manager.
2. Confirm peer dependencies requested by the docs are installed.
3. Run the app's typecheck/build script.
4. Smoke-test auth flows touched by the change.

## Maintainer repo validation

When working inside the Better Auth UI repository, follow its current CI workflow and project scripts. Do not expose repository-specific commands as consumer instructions unless the user is explicitly contributing to this repo.

## Docs and llms validation

When docs or agent-facing docs routes change:

1. Build the docs with the repository's configured docs build script.
2. Confirm `llms.txt` and `llms-full.txt` are generated from source routes.
3. Grep generated output for the expected framework or UI surface.
4. Do not edit generated `dist` or `llms` files by hand.
