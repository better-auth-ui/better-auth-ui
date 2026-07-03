# Upstream Better Auth resources

Better Auth UI is built on top of Better Auth. Use upstream Better Auth resources when the task is about authentication engine behavior rather than UI/adapters.

## When to consult upstream Better Auth

Consult Better Auth docs, skills, or MCP before changing Better Auth UI when the request involves:

- `auth` server configuration;
- Better Auth plugins or plugin options;
- database adapters, schema, migrations, or Kysely behavior;
- sessions, cookies, trusted origins, rate limiting, or auth endpoints;
- Better Auth client method contracts;
- CLI setup, generated schema, or provider configuration;
- behavior that fails before Better Auth UI hooks/components run.

## Official upstream resources

| Resource | Use |
| --- | --- |
| `https://better-auth.com/llms.txt` | Machine-friendly Better Auth docs index and markdown links |
| `https://better-auth.com/docs/ai-resources` | Official AI resources entry point |
| `https://better-auth.com/docs/ai-resources/skills` | Better Auth skill pack install instructions |
| `https://better-auth.com/docs/ai-resources/mcp` | Better Auth remote docs MCP setup |
| `npx skills add better-auth/skills` | Install upstream Better Auth agent skills |
| `https://mcp.better-auth.com/mcp` | Remote Better Auth documentation MCP endpoint |
| `npx auth@latest mcp` | Better Auth CLI helper for configuring MCP clients |

## Decision rule

If a bug reproduces with raw Better Auth client/server calls and no Better Auth UI component or hook, treat it as upstream Better Auth behavior first. If the raw Better Auth behavior works but a Better Auth UI hook/component fails, inspect Better Auth UI adapters and shared core contracts.

## Safe investigation flow

1. Read Better Auth UI docs for the requested UI/framework surface.
2. Read Better Auth upstream docs for the underlying auth/plugin/session behavior.
3. Compare the Better Auth client/server contract with the Better Auth UI core descriptor or adapter.
4. Fix the layer that owns the mismatch; do not patch UI code around an upstream setup error.
