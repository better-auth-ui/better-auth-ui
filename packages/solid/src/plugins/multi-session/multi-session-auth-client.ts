import type { multiSessionClient } from "better-auth/client/plugins"
import type { createAuthClient } from "better-auth/solid"

export type MultiSessionAuthClient = ReturnType<
  typeof createAuthClient<{ plugins: [ReturnType<typeof multiSessionClient>] }>
>
