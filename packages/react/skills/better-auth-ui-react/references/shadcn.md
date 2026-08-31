# Copied shadcn/ui components

Use this reference with the React skill when the application uses shadcn/ui.

## Installation

Inspect the application's `components.json`, aliases, and existing UI primitives before installation. Preserve its Radix or Base UI choice.

Install the auth surface with the project's package runner:

```bash
bunx --bun shadcn@latest add @better-auth-ui/auth
```

Add settings and user controls only when the application needs them:

```bash
bunx --bun shadcn@latest add @better-auth-ui/settings @better-auth-ui/user-button
```

The registry copies files into the application. Import `AuthProvider`, `Auth`, `Settings`, and `UserButton` from those local files.

Read the generated paths instead of assuming `@/components`. Do not replace local imports with nonexistent exports from `@better-auth-ui/react`.

Use the copied provider wrapper. It adds the UI's error presentation around the shared React provider. Mount the configured Sonner toaster.

## Routing

Mount auth and settings routes that pass their path segment to `<Auth path={path} />` or `<Settings path={path} />`.

These components select a view. They do not create framework routes or mount the Better Auth server handler.

Keep route validation synchronized with base and enabled plugin view paths. Preserve callback query parameters and invitation IDs during navigation.

Pass the application's router link adapter through the copied provider's `Link` prop. Its link contract accepts `href`.

For organization screens, read the organization slug from the route. Pass it to the copied `organizationPlugin`, using `null` on personal-account routes.

## Customization

Review copied files before changes. Preserve consumer customizations when updating registry entries.

Try component props and application composition before modifying UI primitives. Keep form labels, errors, keyboard access, and focus behavior intact.

Use the project's existing shadcn building blocks for new controls. Use `gap-*` for spacing.

## References

- [shadcn quick start](https://better-auth-ui.com/docs/shadcn)
- [AuthProvider](https://better-auth-ui.com/docs/shadcn/components/auth-provider)
- [Organizations](https://better-auth-ui.com/docs/shadcn/plugins/organization)
