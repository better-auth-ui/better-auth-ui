# React Aria shadcn example

This example runs Better Auth UI with the official shadcn React Aria components and TanStack Start.
It uses the shared `@better-auth-ui/react` hooks and supports the same registry components and plugins as the Radix and Base UI examples.

## Run locally

Run these commands from the workspace root:

```bash
bun install --frozen-lockfile
bun nx run start-shadcn-aria-example:dev
```

Set `DATABASE_URL` and `BETTER_AUTH_SECRET` in your local environment before you start the application.
Use a PostgreSQL database with the schema in `src/lib/schema.ts`.
The email transport defaults to a local SMTP server on port 1025.
Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, and `MAIL_FROM` to use another transport.
The GitHub sign-in example also needs `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`.

## Validate changes

Run the example checks and registry checks from the workspace root:

```bash
CI=true bun nx run-many -t test typecheck build -p start-shadcn-aria-example
bun nx run start-shadcn-example:registry:test
bun nx run start-shadcn-example:registry:build
bun nx run workspace:lint
```

The registry build produces `aria-*` entries for every supported shadcn style.
Registry tests compile standalone installations with the example's React Aria primitives.

## Shared sources

Run `bun nx run start-shadcn-example:source:sync` after you change shared shadcn sources.
The sync script preserves Aria components listed in `ARIA_UI_OVERRIDES`.
Update their behavior alongside the other supported platforms.

## Install in your application

Initialize shadcn with the Aria base:

```bash
bunx --bun shadcn@latest init --base aria
```

Add this registry to your application's `components.json`:

```json
{
  "registries": {
    "@better-auth-ui": "https://better-auth-ui.com/r/{style}/{name}.json"
  }
}
```

Install the auth components:

```bash
bunx --bun shadcn@latest add @better-auth-ui/auth
```

Read the [Better Auth UI quick start](https://better-auth-ui.com/docs/shadcn) for provider configuration and plugin installation.
