# Copied Zaidan components

Use this reference with the Solid skill when the application needs auth UI components.

## Installation

Prepare Better Auth, Solid, Solid Query, Tailwind v4, and the application's routing first.

```bash
bun add @better-auth-ui/solid @tanstack/solid-query better-auth solid-js
bunx --bun shadcn@latest add https://better-auth-ui.com/r/solid/auth.json
```

Add settings and user controls when required:

```bash
bunx --bun shadcn@latest add https://better-auth-ui.com/r/solid/settings.json https://better-auth-ui.com/r/solid/user-button.json
```

Use the `/r/solid/` registry URLs. The `@better-auth-ui/auth` shorthand installs the React shadcn integration.

The registry copies Solid UI primitives, components, and supporting code. Read the generated files and respect the application's aliases.

Import composed UI components and the provider wrapper from their copied local paths. Do not import them from the Solid data package.

## Provider and routes

Use the copied provider wrapper, router link adapter, and toaster. Pass the same Solid Query client used by loaders.

Install the auth and settings routes in the framework. Pass each route's path segment to the corresponding local component.

Include enabled plugin view paths when validating route segments. Preserve search parameters for callbacks, invitations, and redirects.

For organization pages, read the slug reactively and pass it to the copied `organizationPlugin`. Use `null` outside organization routes.

Keep Solid JSX and reactive props intact. Do not copy React hooks, React event types, or HeroUI components into this integration.

## Optional features

Plugin UI entries are separate from server/client plugin registration. For example, the passkey UI is available at `/r/solid/passkey.json`.

Use native Solid email templates from the Solid email entrypoint or the copied Zaidan templates. Do not import React email components.

Preserve local modifications when updating copied registry files. Try consumer props and composition before modifying UI primitives.

## References

- [Zaidan quick start](https://better-auth-ui.com/docs/zaidan)
- [TanStack Start integration](https://better-auth-ui.com/docs/zaidan/integrations/tanstack-start)
- [Organizations](https://better-auth-ui.com/docs/zaidan/plugins/organization)
