# Better Auth UI repo map

Use this map after selecting a surface in `SKILL.md`.

## Packages

| Path | Purpose |
| --- | --- |
| `packages/core` | Shared Better Auth UI contracts: auth client/server helpers, query/mutation descriptors, keys, plugin contracts, server helpers |
| `packages/react` | React runtime package: hooks, React Query adapters, providers, React server helpers, plugin hook adapters |
| `packages/solid` | Solid runtime package: hooks, Solid Query adapters, providers, Solid server helpers, plugin hook adapters |
| `packages/heroui` | Packaged HeroUI React components and plugins |

## Documentation

| Path | Purpose |
| --- | --- |
| `apps/docs/content/docs/react` | React package docs, queries, mutations, SSR |
| `apps/docs/content/docs/solid` | Solid package docs, queries, mutations, SSR |
| `apps/docs/content/docs/shadcn` | shadcn/ui copied React component docs |
| `apps/docs/content/docs/heroui` | HeroUI packaged component docs |
| `apps/docs/content/docs/zaidan` | Zaidan copied Solid component docs |
| `apps/docs/src/routes/llms[.]txt.ts` | Agent docs index route; generated from Fumadocs source |
| `apps/docs/src/routes/llms-full[.]txt.ts` | Full agent docs route; generated from processed markdown |
| `apps/docs/src/routes/docs.{$}[.]md.ts` | Raw markdown route for docs pages |

## Examples

| Path | Surface |
| --- | --- |
| `examples/next-shadcn-example` | React + shadcn/ui + Next.js |
| `examples/start-shadcn-example` | React + shadcn/ui + TanStack Start |
| `examples/next-heroui-example` | React + HeroUI + Next.js |
| `examples/start-heroui-example` | React + HeroUI + TanStack Start |
| `examples/start-solid-zaidan-example` | Solid + Zaidan + TanStack Start |

## Tests and project config

| Path | Purpose |
| --- | --- |
| `packages/*/tests` | Package-level contract, export, behavior, and parity tests |
| `apps/docs/tests` | Docs parity and content tests |
| `examples/*/tests` | Example integration and smoke tests |
| package/project config files | Workspace targets and package scripts for maintainers; consumers may use different tooling |

## Generated output caution

Do not edit `apps/docs/dist` or package `dist` files by hand. Fix source docs/code, then rebuild if generated output is required for validation.
