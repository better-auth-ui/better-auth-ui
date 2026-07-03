---
name: core
description: >
  Framework-agnostic Better Auth UI data layer: authQueryKeys, authMutationKeys,
  TanStack Query option factories (sessionOptions, listAccountsOptions,
  listSessionsOptions, accountInfoOptions), mutation factories (signInEmailOptions,
  signUpEmailOptions, signOutOptions, updateUserOptions, changePasswordOptions),
  createAuthPlugin, AuthConfig, server-side SSR helpers. Load when working with
  @better-auth-ui/core, shared auth query/mutation contracts, query keys,
  invalidation, or SSR prefetching.
license: MIT
metadata:
  type: core
  library: better-auth-ui
  library_version: '1.6.27'
sources:
  - 'better-auth-ui/better-auth-ui:packages/core/src/index.ts'
  - 'better-auth-ui/better-auth-ui:packages/core/src/server.ts'
---

# Better Auth UI Core

`@better-auth-ui/core` is a framework-agnostic layer of TanStack Query
`queryOptions`/`mutationOptions` factories over a Better Auth client. It has no
hooks, no components, and no framework runtime. React and Solid packages adapt
these contracts — never reimplement keys, endpoint selection, or invalidation
in framework code.

## Setup

```ts
import { createAuthClient } from "better-auth/client"
import { sessionOptions, authQueryKeys } from "@better-auth-ui/core"
import { QueryClient } from "@tanstack/query-core"

const authClient = createAuthClient()
const queryClient = new QueryClient()

const session = await queryClient.fetchQuery(sessionOptions(authClient))
await queryClient.invalidateQueries({ queryKey: authQueryKeys.session })
```

## Core Patterns

### Query factories

Each read ships `xOptions`, `ensureX`, `prefetchX`, and `fetchX` variants:
`sessionOptions`, `listAccountsOptions`, `listSessionsOptions`,
`accountInfoOptions`.

```ts
import { listAccountsOptions, prefetchListAccounts } from "@better-auth-ui/core"

await prefetchListAccounts(queryClient, authClient)
const accounts = queryClient.getQueryData(listAccountsOptions(authClient).queryKey)
```

### Query keys

All keys are prefixed `"auth"`. Per-user reads nest under
`["auth", "user", userId, ...]`. Always use `authQueryKeys` /
`authMutationKeys` — never hand-write key arrays.

### SSR server helpers

`@better-auth-ui/core/server` calls your Better Auth server instance
(`Pick<Auth, "api">`) directly — no HTTP round trip:

```ts
import { sessionQueryServer } from "@better-auth-ui/core/server"
import { auth } from "./auth"

const session = await sessionQueryServer(auth, { headers: request.headers })
```

Because server helpers share query keys with client factories, hydrated SSR
data is reused without a refetch.

### Plugins

`createAuthPlugin` defines shared plugin contracts. Plugin subpaths mirror the
pattern: `@better-auth-ui/core/plugins/{api-key, delete-user, magic-link,
multi-session, organization, passkey, theme, username}`, most with a paired
`/server` entry.

## Common Mistakes

### HIGH Treating factory results as `{ data, error }` envelopes

Wrong:

```ts
const { data, error } = await queryClient.fetchQuery(sessionOptions(authClient))
if (error) handle(error)
```

Correct:

```ts
try {
  const session = await queryClient.fetchQuery(sessionOptions(authClient))
} catch (error) {
  // BetterFetchError
}
```

All factories wire `throw: true` into `fetchOptions`, so failures reject
instead of resolving an error envelope.

Source: packages/core/src/index.ts

### HIGH Hand-rolling query keys for invalidation

Wrong:

```ts
queryClient.invalidateQueries({ queryKey: ["session"] })
```

Correct:

```ts
import { authQueryKeys } from "@better-auth-ui/core"
queryClient.invalidateQueries({ queryKey: authQueryKeys.session })
```

Keys are prefixed `"auth"` and per-user reads nest under
`["auth", "user", userId]`; ad-hoc keys silently never match.

Source: packages/core/src/index.ts

### MEDIUM Importing server helpers into client bundles

Wrong:

```ts
import { sessionQueryServer } from "@better-auth-ui/core/server" // in client code
```

Correct:

```ts
import { sessionOptions } from "@better-auth-ui/core" // client
```

`/server` helpers require a server `Auth` instance and must only run
server-side; the client uses the `authClient`-based factories.

Source: packages/core/src/server.ts
