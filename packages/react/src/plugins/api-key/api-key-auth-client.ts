import type { apiKeyClient } from "@better-auth/api-key/client"
import type { createAuthClient } from "better-auth/react"

export type ApiKeyAuthClient = ReturnType<
  typeof createAuthClient<{ plugins: [ReturnType<typeof apiKeyClient>] }>
>
