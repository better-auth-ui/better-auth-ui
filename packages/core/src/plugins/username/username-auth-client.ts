import type { createAuthClient } from "better-auth/client"
import type { usernameClient } from "better-auth/client/plugins"
import type { OmitUseAndStoreKeys } from "../../lib/auth-client"

export type UsernameAuthClient = OmitUseAndStoreKeys<
  ReturnType<
    typeof createAuthClient<{ plugins: [ReturnType<typeof usernameClient>] }>
  >
>
