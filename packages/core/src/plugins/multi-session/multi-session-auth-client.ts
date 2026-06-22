import type { createAuthClient } from "better-auth/client"
import type { multiSessionClient } from "better-auth/client/plugins"
import type { OmitUseAndStoreKeys } from "../../lib/auth-client"

export type MultiSessionAuthClient = OmitUseAndStoreKeys<
  ReturnType<
    typeof createAuthClient<{
      plugins: [ReturnType<typeof multiSessionClient>]
    }>
  >
>
