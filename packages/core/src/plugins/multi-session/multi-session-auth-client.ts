import type { createAuthClient } from "better-auth/client"
import type { multiSessionClient } from "better-auth/client/plugins"
import type { OmitUseKeys } from "../../lib/auth-client"

export type MultiSessionAuthClient = OmitUseKeys<
  ReturnType<
    typeof createAuthClient<{
      plugins: [ReturnType<typeof multiSessionClient>]
    }>
  >
>
