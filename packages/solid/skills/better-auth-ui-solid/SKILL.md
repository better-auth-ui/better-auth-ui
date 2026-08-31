---
name: better-auth-ui-solid
description: Integrate Better Auth UI Solid providers, reactive queries, mutations, SSR, and plugins. Use for @better-auth-ui/solid and copied Zaidan auth components in Solid applications, including TanStack Start.
license: MIT
metadata:
  library: "@better-auth-ui/solid"
  framework: solid
---

# Better Auth UI for Solid

Use the installed package exports as the authority for the API version. This skill covers the 1.7 package structure.

For copied UI, read [the Zaidan integration](references/zaidan.md). The Solid package provides the data layer, not the copied `Auth` or `Settings` components.

## Configure the application

1. Configure the Better Auth server and mount its handler.
2. Create the client with `createAuthClient` from `better-auth/solid`.
3. Wrap consumers with `AuthProvider` from the selected integration.
4. Pass `authClient`, `navigate`, and the application's Solid Query `queryClient`.
5. Add the matching server, client, and UI plugins for optional features.

Use `@tanstack/solid-query`, not React Query. Pass the QueryClient explicitly so loaders and components share one cache.

For SSR, create that client per request. Do not rely on the provider's fallback cache for server rendering.

## Preserve reactivity

Solid hook options use accessors. React hook options use objects. Do not translate one framework's examples without adapting this difference.

```ts
import { useSession, useSignInEmail } from "@better-auth-ui/solid"

const session = useSession(authClient, () => ({ staleTime: 5_000 }))
const signIn = useSignInEmail(authClient, () => ({
  onSuccess: () => navigate({ to: "/settings/account" })
}))
```

Call hooks within a Solid owner, such as a component. Read `session.data`, `session.isPending`, and mutation state inside reactive expressions.

Keep reactive props and query results intact. Destructuring them can freeze a value that must change.

Pass an accessor for an optional custom QueryClient argument. Keep dynamic query parameters inside the options accessor.

Use Solid control flow for dependent content. Keep page headings, navigation, and independent content visible while individual queries resolve.

## Server rendering and routes

Use `ensureSession(queryClient, authClient)` from `@better-auth-ui/core` in browser loaders.

Use `ensureSessionServer(queryClient, auth, { headers })` from `@better-auth-ui/core/server` in server-only code.

The server helper needs the Better Auth server instance and incoming request headers. Browser helpers need the Solid auth client.

Pass the same request-scoped QueryClient through loaders, hydration, and `AuthProvider`. Keep server-only imports outside browser bundles.

TanStack Solid Router exposes route data through accessors. Read `Route.useRouteContext()()` and route parameters reactively.

Enforce authorization in protected server endpoints. A component guard or cached session alone does not protect server data.

## Plugins and organizations

Import optional hooks from `@better-auth-ui/solid/plugins/<plugin>`. Import shared factories from the corresponding core plugin entrypoint.

Use Zaidan's copied UI plugin when it must contribute screens. A core plugin does not install Solid component files.

Select organizations through route slugs or explicit IDs. Keep `organizationPlugin({ slug })` synchronized with route changes.

Pass `null` on personal-account routes. `undefined` selects session-based organization behavior, so do not use it for explicit organization access.

Do not call `setActive` to choose authorization scope. Validate membership and permissions for the requested organization on the server.

## References

- [Solid package](https://better-auth-ui.com/docs/solid)
- [Solid queries](https://better-auth-ui.com/docs/solid/queries)
- [Solid mutations](https://better-auth-ui.com/docs/solid/mutations)
- [Solid SSR](https://better-auth-ui.com/docs/solid/ssr)
- [Documentation index](https://better-auth-ui.com/llms.txt)

Website examples follow the current release. Check the installed package before using an API from newer documentation.
