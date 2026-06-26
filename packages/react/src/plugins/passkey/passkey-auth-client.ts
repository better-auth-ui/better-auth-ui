import type { passkeyClient } from "@better-auth/passkey/client"
import type { createAuthClient } from "better-auth/react"

export type PasskeyAuthClient = ReturnType<
  typeof createAuthClient<{ plugins: [ReturnType<typeof passkeyClient>] }>
>
