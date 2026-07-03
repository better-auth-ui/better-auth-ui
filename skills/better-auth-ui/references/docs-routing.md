# Better Auth UI docs routing

Use this reference after loading `skills/better-auth-ui/SKILL.md`.

## Package-shipped skills (TanStack Intent)

Better Auth UI packages ship versioned TanStack Intent skills inside the npm packages. Prefer these when the consumer project has `@better-auth-ui/*` installed, since they always match the installed package version. Read them directly from `node_modules` — no extra tooling required:

| Skill | Path |
| --- | --- |
| Core data layer | `node_modules/@better-auth-ui/core/skills/core/SKILL.md` |
| React hooks | `node_modules/@better-auth-ui/react/skills/react/SKILL.md` |
| Solid hooks | `node_modules/@better-auth-ui/solid/skills/solid/SKILL.md` |
| HeroUI components | `node_modules/@better-auth-ui/heroui/skills/heroui/SKILL.md` |

If the project uses TanStack Intent, `npx @tanstack/intent@latest load @better-auth-ui/<pkg>#<skill>` loads the same files.

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
| Better Auth UI package skills | Read `node_modules/@better-auth-ui/<pkg>/skills/<skill>/SKILL.md` directly |
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
