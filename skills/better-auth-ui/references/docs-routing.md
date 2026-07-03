# Better Auth UI docs routing

Use this reference after loading `skills/better-auth-ui/SKILL.md`.

## Canonical agent docs

| Need | URL |
| --- | --- |
| Docs index for agents | `https://better-auth-ui.com/llms.txt` |
| Full docs context | `https://better-auth-ui.com/llms-full.txt` |
| Project docs root | `https://better-auth-ui.com/docs` |

## Upstream Better Auth resources

Use these when the task involves Better Auth server behavior, plugins, adapters, sessions, auth endpoints, CLI setup, or database behavior rather than Better Auth UI presentation/adapters.

| Need | URL or command |
| --- | --- |
| Better Auth docs for agents | `https://better-auth.com/llms.txt` |
| Better Auth AI resources | `https://better-auth.com/docs/ai-resources` |
| Better Auth MCP docs | `https://better-auth.com/docs/ai-resources/mcp` |
| Better Auth skills docs | `https://better-auth.com/docs/ai-resources/skills` |
| Install upstream Better Auth skills | `npx skills add better-auth/skills` |
| Configure Better Auth docs MCP | `npx auth@latest mcp` or endpoint `https://mcp.better-auth.com/mcp` |

## Surface routing

| Surface | Package or registry | Docs path | Local repo paths |
| --- | --- | --- | --- |
| shadcn/ui copied React components | `https://better-auth-ui.com/r/*.json` | `/docs/shadcn` | `apps/docs/content/docs/shadcn`, shadcn examples |
| HeroUI packaged React components | `@better-auth-ui/heroui` | `/docs/heroui` | `packages/heroui`, HeroUI examples |
| React runtime hooks and helpers | `@better-auth-ui/react` | `/docs/react` | `packages/react` |
| Solid runtime hooks and helpers | `@better-auth-ui/solid` | `/docs/solid` | `packages/solid` |
| Zaidan copied Solid components | `https://better-auth-ui.com/r/solid/*.json` | `/docs/zaidan` | `apps/docs/content/docs/zaidan`, `examples/start-solid-zaidan-example` |
| Shared auth contracts | `@better-auth-ui/core` | framework docs plus core exports | `packages/core` |

## Validation hints

Do not assume the consumer project uses this repository's tooling. Inspect `package.json`, lockfiles, and framework config first, then run the narrowest available script.

Common validation choices:

```bash
# Use the package manager already present in the consumer project.
<pkg-manager> install
<pkg-manager> run typecheck
<pkg-manager> run lint
<pkg-manager> run test
<pkg-manager> run build
```

When docs or agent-facing routes change in this repository, build the docs through the repository's configured scripts and confirm generated `llms.txt` output contains the expected docs links.
