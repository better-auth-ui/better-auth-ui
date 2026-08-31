---
name: better-auth-ui-core
description: Use Better Auth UI core query and mutation factories, server helpers, and explicit organization access. Use when integrating @better-auth-ui/core with loaders, SSR, custom data layers, or Better Auth plugins.
license: MIT
metadata:
  library: "@better-auth-ui/core"
---

# Better Auth UI core

Use the installed package exports as the authority for the API version. This skill covers the 1.7 package structure.

## Choose the entrypoint

| Task | Import from |
| --- | --- |
| Browser client queries, mutations, cache keys, configuration | `@better-auth-ui/core` |
| Direct calls to a Better Auth server instance | `@better-auth-ui/core/server` |
| Optional plugin factories | `@better-auth-ui/core/plugins/<plugin>` |
| Optional plugin server helpers | `@better-auth-ui/core/plugins/<plugin>/server` |

Keep server imports and the Better Auth server instance outside browser bundles. The core package does not install UI components or routes.

## Queries and mutations

- Use a factory such as `sessionOptions(authClient)` when a Query API needs an options object.
- Use `ensureSession(queryClient, authClient)` in a loader that needs the session result.
- Use `prefetchSession(queryClient, authClient)` to warm the cache. It does not return session data or propagate fetch errors.
- Use `fetchSession(queryClient, authClient)` for a query result with normal Query freshness rules.
- Read `sessionOptions(authClient).queryKey` or `authQueryKeys` instead of inventing cache keys.
- Preserve mutation keys and metadata when extending factories such as `signInEmailOptions(authClient)`.

Factories return unwrapped data and reject on errors. Do not treat their results as Better Auth's raw `{ data, error }` response.

Framework `AuthProvider` implementations install mutation invalidation. A custom integration without a provider needs `setupMutationInvalidation(queryClient)` and its cleanup function.

## Server rendering

Create a QueryClient for each server request. Reuse that client across the request's loaders and rendered providers.

Pass incoming headers to server helpers so Better Auth can read the request's cookies:

```ts
import { ensureSessionServer } from "@better-auth-ui/core/server"

const session = await ensureSessionServer(queryClient, auth, {
  headers: request.headers
})
```

Here, `auth` is the application's Better Auth server instance. `queryClient` belongs to the current request.

The browser equivalent is `ensureSession(queryClient, authClient)`. Server and browser helpers share cache keys for hydration.

Route guards improve navigation behavior. Enforce authentication and authorization again in server endpoints that read or change protected data.

## Plugins and organizations

Configure the Better Auth server plugin and its matching client plugin before using plugin factories. A UI plugin does not enable server endpoints.

Use explicit organization slugs or IDs for organization queries and mutations. Check membership and permissions on the server for that organization.

For UI integrations, pass the route slug to `organizationPlugin({ slug })`. Pass `null` on personal-account routes.

Do not leave the slug `undefined`: that selects session-based organization behavior. Do not use `setActive` to determine access.

Prefer plugin factories and keys for organization cache updates. A changed URL alone does not authorize access to another organization.

## References

- [React data APIs](https://better-auth-ui.com/docs/react)
- [Solid data APIs](https://better-auth-ui.com/docs/solid)
- [Server rendering](https://better-auth-ui.com/docs/react/ssr)
- [Organization routing](https://better-auth-ui.com/docs/shadcn/plugins/organization)
- [Documentation index](https://better-auth-ui.com/llms.txt)

The website describes the current release. If it differs from the installed package, inspect that package's exports and source before changing imports.
