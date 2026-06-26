import type { usernameClient } from "better-auth/client/plugins"
import type { createAuthClient } from "better-auth/solid"

export type UsernameAuthClient = ReturnType<
  typeof createAuthClient<{ plugins: [ReturnType<typeof usernameClient>] }>
>
