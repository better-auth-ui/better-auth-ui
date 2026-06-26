import type { passkeyClient } from "@better-auth/passkey/client"
import type { createAuthClient } from "better-auth/solid"

export type PasskeyAuthClient = ReturnType<
  typeof createAuthClient<{ plugins: [ReturnType<typeof passkeyClient>] }>
>
