import type { createAuthClient } from "better-auth/client"
import type { usernameClient } from "better-auth/client/plugins"
import type { OmitUseKeys } from "../../lib/auth-client"

export type UsernameAuthClient = OmitUseKeys<
  ReturnType<
    typeof createAuthClient<{ plugins: [ReturnType<typeof usernameClient>] }>
  >
>
