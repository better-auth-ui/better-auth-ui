---
name: better-auth-ui-react
description: Integrate Better Auth UI React providers, hooks, authentication routes, and plugins. Use for @better-auth-ui/react or copied shadcn/ui auth components, including Next.js and TanStack Start applications.
license: MIT
metadata:
  library: "@better-auth-ui/react"
  framework: react
---

# Better Auth UI for React

Use the installed package exports as the authority for the API version. This skill covers the 1.7 package structure.

## Select the UI

- For copied shadcn/ui components, read [the shadcn integration](references/shadcn.md).
- For packaged HeroUI components, use `@better-auth-ui/heroui` and its `better-auth-ui-heroui` skill when available.
- For a custom interface, use the provider and hooks from `@better-auth-ui/react` directly.

`@better-auth-ui/react` is the shared data layer. It does not export the copied shadcn `Auth`, `Settings`, or `UserButton` components.

## Configure the application

1. Configure Better Auth and mount its handler in the application's server routes.
2. Create the React client with `createAuthClient` from `better-auth/react`.
3. Wrap auth consumers with the selected UI's `AuthProvider`.
4. Pass `authClient`, a router-compatible `navigate`, and the application's `queryClient`.
5. Configure redirect destinations, UI paths, and plugins to match the application's routes.

The navigation callback receives `{ to, replace? }`. Adapt Next.js `router.push` and `router.replace` to this object instead of passing them directly.

The React provider selects an explicit QueryClient first, then an existing Query context, then a fallback. Pass a request-scoped client for SSR.

Use client boundaries for interactive providers and hooks in Next.js. Keep server configuration, secrets, and `/server` imports outside those boundaries.

## Read and change authentication data

```ts
import { useSession, useSignInEmail } from "@better-auth-ui/react"

const session = useSession(authClient, { staleTime: 5_000 })
const signIn = useSignInEmail(authClient)
```

Call these hooks inside a React component or custom hook. Supply the auth client explicitly.

Queries expose TanStack Query state such as `data`, `isPending`, and `error`. Mutations expose `mutate`, `mutateAsync`, and `isPending`.

Use `useSession` from Better Auth UI when consumers share its Query cache. Better Auth's own `authClient.useSession()` uses a different subscription path.

Import optional hooks from `@better-auth-ui/react/plugins/<plugin>`. Import loader factories and helpers from `@better-auth-ui/core` or its plugin entrypoints.

Keep page headings, navigation, and independent content mounted while queries resolve. Show pending states only for unresolved values and dependent actions.

## Loaders and SSR

Use `ensureSession(queryClient, authClient)` for browser loaders. Use `ensureSessionServer(queryClient, auth, { headers })` from `@better-auth-ui/core/server` on the server.

Create one QueryClient per server request. Pass the same client to loaders, hydration, and `AuthProvider`.

For TanStack Start, use the documented Router/Query SSR integration. For Next.js, keep direct server calls in server-only code.

Do not cache one user's session in a module-level server QueryClient. Enforce permissions in server endpoints as well as route guards.

## Plugins and organizations

Enable each feature in three places when applicable: the Better Auth server, its client plugin, and the selected UI plugin.

Use the UI plugin shipped with the selected component system. Core plugins provide shared behavior but do not supply copied UI views.

Include plugin view paths in route validation. Hardcoded base auth paths can reject valid invitation or two-factor routes.

Select organizations from the route slug or an explicit ID. Pass `organizationPlugin({ slug })`, using `null` for personal-account routes.

Keep this value current when the route changes. Do not use session active-organization state or `setActive` as the source of access.

## References

- [React queries](https://better-auth-ui.com/docs/react/queries)
- [React mutations](https://better-auth-ui.com/docs/react/mutations)
- [React SSR](https://better-auth-ui.com/docs/react/ssr)
- [shadcn Next.js integration](https://better-auth-ui.com/docs/shadcn/integrations/nextjs)
- [shadcn TanStack Start integration](https://better-auth-ui.com/docs/shadcn/integrations/tanstack-start)
- [Documentation index](https://better-auth-ui.com/llms.txt)

Website examples follow the current release. Check the installed package before using an API from newer documentation.
