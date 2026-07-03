---
name: react
description: >
  React bindings for Better Auth UI: AuthProvider, useAuth, useSession,
  useAuthenticate, useUser, useListAccounts, useListSessions, useAccountInfo,
  mutation hooks (useSignInEmail, useSignInSocial, useSignUpEmail, useSignOut,
  useChangeEmail, useChangePassword, useUpdateUser), useAuthQuery/useAuthMutation
  escape hatches, React Query integration, SSR hydration. Load when working with
  @better-auth-ui/react hooks, providers, or React auth flows.
license: MIT
metadata:
  type: framework
  library: better-auth-ui
  framework: react
  library_version: '1.6.27'
requires:
  - better-auth-ui/core
sources:
  - 'better-auth-ui/better-auth-ui:packages/react/src/index.ts'
  - 'better-auth-ui/better-auth-ui:packages/react/src/components/auth/auth-provider.tsx'
---

# Better Auth UI React

This skill builds on `better-auth-ui/core`. Read it first for query keys,
factories, and SSR helpers — React hooks are thin adapters over those core
contracts.

## Setup

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AuthProvider } from "@better-auth-ui/react"
import { createAuthClient } from "better-auth/react"

const authClient = createAuthClient()
const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider
        authClient={authClient}
        navigate={({ to, replace }) =>
          replace ? router.replace(to) : router.push(to)
        }
      >
        {children}
      </AuthProvider>
    </QueryClientProvider>
  )
}
```

`AuthProvider` deep-merges a partial `AuthConfig` with defaults, resolves a
`QueryClient` (prop → context → internal fallback with `staleTime: 5000`), and
mounts a `MutationInvalidator` that keeps auth queries fresh after mutations.

## Hooks and Components

### Session and auth state

```tsx
import { useSession, useAuthenticate, useUser } from "@better-auth-ui/react"

const { data: session } = useSession()
useAuthenticate() // redirects unauthenticated users via navigate()
const user = useUser()
```

### Mutations

```tsx
import { useSignInEmail } from "@better-auth-ui/react"

const signIn = useSignInEmail()
await signIn.mutateAsync({ email, password })
```

Invalidation is automatic via core's `setupMutationInvalidation` — do not
manually invalidate auth queries after built-in mutations.

### Escape hatches

```tsx
import { useAuthQuery, useAuthMutation } from "@better-auth-ui/react"

const custom = useAuthQuery((client) => client.myPlugin.list(), ["auth", "my-plugin"])
```

### Plugin subpaths

`@better-auth-ui/react/plugins/{api-key, captcha, magic-link, multi-session,
organization, passkey, username}` each export plugin-specific query/mutation
hooks. Email templates live under `@better-auth-ui/react/email`.

## Common Mistakes

### HIGH Porting Solid Accessor-style options into React hooks

Wrong:

```tsx
useAccountInfo(() => ({ accountId }))
```

Correct:

```tsx
useAccountInfo({ accountId })
```

React hooks take plain option objects; only the Solid package wraps options in
`Accessor` thunks.

Source: packages/react/src/index.ts

### HIGH Rendering AuthProvider without navigate wiring in a routed app

Wrong:

```tsx
<AuthProvider authClient={authClient}>{children}</AuthProvider>
```

Correct:

```tsx
<AuthProvider
  authClient={authClient}
  navigate={({ to, replace }) => (replace ? router.replace(to) : router.push(to))}
>
  {children}
</AuthProvider>
```

`useAuthenticate` and post-auth redirects route through `navigate`; without it,
redirects fall back to full page loads and break SPA navigation.

Source: packages/react/src/components/auth/auth-provider.tsx

### MEDIUM Duplicating SSR prefetch keys

Wrong:

```tsx
await queryClient.prefetchQuery({ queryKey: ["session"], queryFn: fetchSession })
```

Correct:

```tsx
import { sessionQueryServer } from "@better-auth-ui/core/server"
// hydrate using core helpers so keys match the client hooks
```

Core server helpers share query keys with the client hooks, so hydrated data
is reused without a refetch; custom keys cause a duplicate client fetch.

Source: packages/core/src/server.ts
