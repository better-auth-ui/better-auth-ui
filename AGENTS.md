# Package Manager

This workspace uses **bun** — NOT pnpm or npm.

## Docs

When using third party libraries, use MCP to look up the docs.

## Quality Gates

Before completing any task, ensure all of the following pass:

1. **Oxfmt**: No formatting errors in modified files.
2. **Oxlint**: No lint errors in the project.

## TypeScript toolchain

- Use Nx's [TypeScript 7 guidance](https://nx.dev/docs/kb/typescript-7) for compiler updates.
- Keep `@typescript/native` aliased to TypeScript 7 and `typescript` aliased to `@typescript/typescript6` across workspace dependencies.
- Use `tsc` for native compilation and typechecking. Use the `typescript` alias for API tooling and `tsc6` for legacy compiler tasks.
- Include both compiler dependencies in Nx cache inputs for tasks that use the compiler.
- Run the full validation suite and declaration consumer checks before you commit compiler updates.

## Localization parity

- When you add, rename, or remove a localization key, update every locale in `packages/locales/src` in the same change.
- Keep translated keys and interpolation placeholders consistent with the English localization, including plugin messages.
- Add complete translations instead of type assertions or English fallbacks that hide missing keys.
- Run `CI=true bun nx run-many -t test typecheck -p @better-auth-ui/locales` before you commit localization changes.

## CI validation

- Before you push, run the affected builds, tests, and typechecks, plus the workspace lint target.
- Keep Playwright installation and cache keys tied to the locked executable through `bun run playwright`.
- Keep dependency installation reproducible with `bun install --frozen-lockfile`.
- Test behavior and registry integrity instead of literal source strings or documentation wording.
- Before you merge, wait for the actual `CI` workflow to finish successfully.
- A green `autofix.ci` check only confirms formatting. It does not confirm that builds, tests, or typechecks pass.

## Platform Parity

- Keep all supported platforms at feature and UI parity.
- Implement every feature and UI change for React and Solid.
- Implement every feature and UI change for shadcn/ui, HeroUI, and Zaidan.
- Do not complete a change while any platform remains behind the others.

## Source sync

- Run `bun nx run start-shadcn-example:source:sync` to copy shared shadcn sources into the docs, Next.js, Base UI, and React Aria examples.
- Keep React Aria components that use native primitive APIs in `ARIA_UI_OVERRIDES` in `examples/start-shadcn-example/scripts/sync-consumers.sh`.
- Keep Base UI components that use different primitive APIs in `BASE_UI_OVERRIDES` in `examples/start-shadcn-example/scripts/sync-consumers.sh`.
- Keep `components/auth/organization/invite-member-dialog.tsx` in that override list. Its checkbox menu items use Base UI's `onCheckedChange`; the Radix dialog uses `onSelect`.
- When you change invitation role selection, run the browser tests for Radix, Base UI, React Aria, HeroUI, and Solid/Zaidan.

<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- For navigating/exploring the workspace, invoke the `nx-workspace` skill first - it has patterns for querying projects, targets, and dependencies
- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- Prefix nx commands with the workspace's package manager (e.g., `pnpm nx build`, `npm exec nx test`) - avoids using globally installed CLI
- You have access to the Nx MCP server and its tools, use them to help the user
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md`. Not all plugins have this file - proceed without it if unavailable.
- NEVER guess CLI flags - always check nx_docs or `--help` first when unsure

## Scaffolding & Generators

- For scaffolding tasks (creating apps, libs, project structure, setup), ALWAYS invoke the `nx-generate` skill FIRST before exploring or calling MCP tools

## When to use nx_docs

- USE for: advanced config options, unfamiliar flags, migration guides, plugin configuration, edge cases
- DON'T USE for: basic generator syntax (`nx g @nx/react:app`), standard commands, things you already know
- The `nx-generate` skill handles generator discovery internally - don't call nx_docs just to look up generator syntax


<!-- nx configuration end-->

# GitHub Copilot Instructions
When generating commit messages, always use the Conventional Commits format:
- Start with a type: feat, fix, docs, style, refactor, test, chore, perf, ci, build
- Optionally include a scope in parentheses
- Follow with a colon and space, then a lowercase description
- Example: feat(auth): add password reset flow
- Example: fix: resolve null pointer in user hook

## HeroUI reference

For HeroUI React component work, read [.github/agent-references/heroui-react.md](.github/agent-references/heroui-react.md).
Load only the component documentation relevant to the task. Regenerate that reference instead of overwriting this file.

## React conventions

- Use PascalCase for React component names. Match the existing component filename convention.
- Use kebab-case for new hook and utility filenames, unless this repository documents another convention.
- Use stable domain identities as React keys. Do not use array indexes as keys.
- Use an existing `generateN` helper or stable placeholder IDs for fixed skeleton slots.
- Keep page structure, headings, navigation, labels, and independent content mounted while data loads.
- Show skeletons only for unresolved values, rows, and permission-dependent actions. Do not block a page on its slowest query.

## Tailwind spacing

- Use `gap-*` utilities for spacing between elements. Do not use `space-*` utilities.

## shadcn/ui

- For shadcn/ui work, use the `shadcn` skill and component documentation.
- Compose existing shadcn/ui components before writing custom primitives. Use `Field`, `InputGroup`, and `Item` where appropriate.

## Design skills

- For visual design work, use `frontend-design` and `uncodixfy`.

## Cloudflare tooling

- Use `cf` for direct Cloudflare CLI commands. Prefer existing package scripts for project workflows.
- For new Cloudflare configuration, prefer `cloudflare.config.ts`. Preserve existing configuration formats during unrelated work.

## Drizzle migrations

- Apply these rules to `apps/heroui-dev/` and examples with a `drizzle.config.ts`.
- Edit the schema referenced by the target project's `drizzle.config.ts` first.
- From that project directory, run `bunx --bun drizzle-kit generate --name <migration-name>`.
- Treat each project's `drizzle/` SQL and metadata as generated output. Do not hand-edit them.
- Commit generated migration artifacts together, exactly as Drizzle produces them.
- Check the deployment workflow before applying migrations. Do not assume a push applies them automatically.

## Fumadocs content

- Keep collection paths and front matter consistent with `apps/docs/source.config.ts`.
- Use `.md` for plain content and `.mdx` when imports or React components are needed.
- Use the front-matter title as the page heading. Start body sections at `##`.
- Register shared MDX components through the existing component registry. Extract reusable components instead of long inline JSX.
- Use registered Fumadocs components for callouts, related links, tabs, steps, FAQs, and API tables.
- Give each `Tab` an explicit `value`. Use stable heading anchors when other pages link to them.
- Use descriptive links, language-tagged code fences, and useful image alt text.
- Preview changed pages and check links, code blocks, tables, and images before publishing.
- For YouTube embeds, reuse the existing component when available. Use `/embed/VIDEO_ID` with a clear title.
- Keep video embeds responsive at 16:9. Include a text summary and do not autoplay.
