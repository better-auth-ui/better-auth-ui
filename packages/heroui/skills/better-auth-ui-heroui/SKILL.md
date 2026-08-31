---
name: better-auth-ui-heroui
description: Install and configure packaged Better Auth UI components for HeroUI v3. Use for @better-auth-ui/heroui providers, auth and settings routes, styling, localization, and plugin screens in React applications.
license: MIT
metadata:
  library: "@better-auth-ui/heroui"
  framework: react
---

# Better Auth UI for HeroUI

Use the installed package exports as the authority for the API version. This skill covers the 1.7 package structure and HeroUI v3.

HeroUI components are packaged React components. They are separate from the copied shadcn and Solid/Zaidan registries.

## Installation

Configure Better Auth and HeroUI v3 first. HeroUI v3 uses React 19 and Tailwind v4.

```bash
bun add @better-auth-ui/heroui @better-auth-ui/react @better-auth-ui/core @better-auth-ui/locales
```

Add Better Auth UI's styles to the existing global stylesheet after the application's Tailwind and HeroUI setup:

```css
@import "@better-auth-ui/heroui/styles";
```

This import supplies Better Auth UI's Tailwind source configuration. It does not replace HeroUI's own stylesheet.

Import `AuthProvider`, `Auth`, `Settings`, and `UserButton` from `@better-auth-ui/heroui`.

## Provider and navigation

Use the HeroUI `AuthProvider` wrapper. It connects HeroUI navigation and error presentation to the shared React provider.

Pass `authClient`, `navigate`, and the application's React Query `queryClient`. Create the auth client with `createAuthClient` from `better-auth/react`.

The navigation callback accepts `{ to, replace? }`. Adapt the framework router to this contract.

For SSR, use a QueryClient per request and share it with loaders and hydration. Keep interactive providers within the appropriate client boundary.

Use hooks such as `useSession(authClient)` from `@better-auth-ui/react`. Hook options are React objects, not Solid accessors.

## Views and plugins

Mount framework routes for auth and settings. Pass the route segment to `<Auth path={path} />` or `<Settings path={path} />`.

The components select views but do not create routes or mount the Better Auth server handler.

Enable the Better Auth server plugin and matching client plugin before registering the HeroUI plugin on `AuthProvider`.

Import UI plugins from `@better-auth-ui/heroui/plugins/<plugin>`. These provide HeroUI screens in addition to the shared plugin behavior.

Include plugin view paths in route validation. Preserve callback, redirect, and invitation search parameters.

For organization screens, pass the route slug to `organizationPlugin({ slug })`. Use `null` on personal-account routes.

Update the plugin configuration when the route changes. Do not use session active-organization state or `setActive` to select authorization scope.

Check organization membership and permissions on the server. UI visibility alone does not enforce access.

## Customization and localization

Prefer public component props, composition, and HeroUI's documented styling API. Do not assume HeroUI v2 component contracts.

Pass a locale from `@better-auth-ui/locales/<language-tag>` to `AuthProvider`. Pass partial `localization` overrides for product-specific wording.

Keep stable page content visible during queries. Show pending states at unresolved values and permission-dependent actions.

## References

- [HeroUI quick start](https://better-auth-ui.com/docs/heroui)
- [Next.js integration](https://better-auth-ui.com/docs/heroui/integrations/nextjs)
- [TanStack Start integration](https://better-auth-ui.com/docs/heroui/integrations/tanstack-start)
- [Organizations](https://better-auth-ui.com/docs/heroui/plugins/organization)
- [React data APIs and SSR](https://better-auth-ui.com/docs/react)
- [Documentation index](https://better-auth-ui.com/llms.txt)

Website examples follow the current release. Check the installed package before using an API from newer documentation.
