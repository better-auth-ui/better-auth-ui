---
name: solid
description: >
  Solid bindings for Better Auth UI: AuthProvider, useAuth, useSession,
  useAuthenticate, useUser, query/mutation hooks with Accessor-based options,
  Solid Query integration, resolveAuthConfig, SSR. Load when working with
  @better-auth-ui/solid, Solid auth hooks, solid-js reactivity with auth state,
  or the Zaidan copied Solid component registry runtime.
license: MIT
metadata:
  type: framework
  library: better-auth-ui
  framework: solid
  library_version: '1.6.27'
requires:
  - better-auth-ui/core
sources:
  - 'better-auth-ui/better-auth-ui:packages/solid/src/index.ts'
  - 'better-auth-ui/better-auth-ui:packages/solid/src/lib/auth-provider.tsx'
---

# Better Auth UI Solid

This skill builds on `better-auth-ui/core`. Read it first for query keys,
factories, and SSR helpers — Solid hooks adapt those contracts to Solid Query.

`@better-auth-ui/solid` ships hooks only. Installable Solid UI components come
from the Zaidan copied-component registry
(`https://better-auth-ui.com/r/solid/*.json`), owned by the consuming app.

## Setup

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query"
import { AuthProvider } from "@better-auth-ui/solid"
import { createAuthClient } from "better-auth/solid"

const authClient = createAuthClient()
const queryClient = new QueryClient()

export function Providers(props: { children: any }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider
        authClient={authClient}
        navigate={({ to, replace }) => navigateTo(to, { replace })}
      >
        {props.children}
      </AuthProvider>
    </QueryClientProvider>
  )
}
```

## Hooks and Components

### Session and auth state

```tsx
import { useSession, useAuthenticate, useUser } from "@better-auth-ui/solid"

const session = useSession()
useAuthenticate()
const user = useUser()
```

### Accessor-based options

Hook options are `Accessor` thunks so Solid Query can track reactivity:

```tsx
import { useAccountInfo } from "@better-auth-ui/solid"

const [accountId, setAccountId] = createSignal("acc_1")
const info = useAccountInfo(() => ({ accountId: accountId() }))
```

An optional `queryClient` argument is also passed as `Accessor<QueryClient>`.

### Plugin subpaths

`@better-auth-ui/solid/plugins/{api-key, captcha, magic-link, multi-session,
organization, passkey, username}` export plugin hooks. Solid email templates
live under `@better-auth-ui/solid/email`.

## Common Mistakes

### HIGH Passing plain option objects instead of Accessors

Wrong:

```tsx
const info = useAccountInfo({ accountId: accountId() })
```

Correct:

```tsx
const info = useAccountInfo(() => ({ accountId: accountId() }))
```

A plain object captures signal values once; Solid Query never re-runs when the
signal changes because options are read outside a tracked scope.

Source: packages/solid/src/hooks/queries/use-account-info.ts

### HIGH Porting React hook semantics into Solid mechanically

Wrong:

```tsx
const { data } = useSession() // destructuring loses reactivity
```

Correct:

```tsx
const session = useSession()
session.data // read inside JSX/tracked scope
```

Destructuring a Solid Query result reads reactive getters once and disconnects
the component from updates.

Source: packages/solid/src/index.ts

### MEDIUM Importing UI components from the package

Wrong:

```tsx
import { SignIn } from "@better-auth-ui/solid"
```

Correct:

```bash
bun x shadcn@latest add https://better-auth-ui.com/r/solid/auth.json
```

The Solid package exports hooks and providers only; components are copied into
the app via the Zaidan registry and owned by the app.

Source: packages/solid/src/index.ts
