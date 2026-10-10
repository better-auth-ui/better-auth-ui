# Contribute to better-auth-ui

Contributions can fix behavior, improve documentation, or add focused tests.

## Before you start

Read [the support guide](SUPPORT.md) for questions and issue routing.
Search existing issues and pull requests. Discuss larger API, architecture, or dependency changes before implementation.

Work from `main` and target that branch in your pull request.
Keep each change focused. Avoid unrelated formatting and dependency updates.

## Prepare a checkout

Use Bun for this Nx workspace. Install the locked dependencies from the repository root.

```bash
bun install --frozen-lockfile
bunx lefthook install
```

Run the commands below from the repository root unless a command names another directory.
On Windows, use `gradlew.bat` in place of `./gradlew` for Gradle commands.

## Repository layout

- `packages/`: core, React, Solid, HeroUI, and locale packages.
- `examples/`: Next.js and TanStack examples for supported UI implementations.
- `apps/docs/`: documentation site.
- `tools/workspace/`: shared workspace checks.

## Verify your change

```bash
bun nx run workspace:lint
bun run format:check
bun nx run-many -t build,typecheck,test
```

Read [AGENTS.md](AGENTS.md). Use `bun nx show projects` and `bun nx show project <name> --json` to find project targets. Scope project checks to the changed packages and their consumers. Keep React and Solid, shadcn/Radix and Base UI, HeroUI, and Zaidan at feature parity. For shared shadcn source changes, run `bun nx run start-shadcn-example:source:sync` and review the consumer diff. Preserve Base UI overrides. Verify auth and invitation flows in each affected example. Do not edit generated declarations to hide source errors.

Run the relevant checks before review. State the command and result in the pull request.
If a check cannot run, explain the missing dependency or service. Do not claim it passed.
Keep generated artifacts consistent with their source and review their diff.

## Style and documentation

Follow the existing code conventions and repository formatter. Keep commit hooks enabled.
Add focused tests for changed logic when practical. Avoid tests that only assert source strings.
Update documentation when commands, APIs, configuration, or expected behavior change.
Keep examples small and reproducible. Preserve exact identifiers, commands, and error messages.

## Open a pull request

Explain the problem and resulting behavior. Link related issues without a placeholder issue number.
List affected packages and all implementations checked. Explain any public API or registry migration.
Include commands and results. State any runtime checks that remain necessary.
Respond to review with a correction or concrete evidence.

Use Conventional Commits: `type(scope): description`, for example `docs(contributing): explain local validation`.
Use a meaningful scope, or omit it. Keep the subject concise and imperative.
Add a body when the reason or compatibility impact is not obvious.

For vulnerabilities, follow [the security reporting instructions](SECURITY.md).
Remove credentials and private data from examples, logs, and screenshots.
