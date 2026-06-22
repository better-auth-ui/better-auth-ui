import type { passkeyClient } from "@better-auth/passkey/client"
import type { createAuthClient } from "better-auth/client"
import type { OmitUseAndStoreKeys } from "../../lib/auth-client"

export type PasskeyAuthClient = OmitUseAndStoreKeys<
  ReturnType<
    typeof createAuthClient<{ plugins: [ReturnType<typeof passkeyClient>] }>
  >
>
