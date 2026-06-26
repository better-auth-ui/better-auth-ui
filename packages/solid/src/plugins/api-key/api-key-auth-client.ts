import type { apiKeyClient } from "@better-auth/api-key/client"
import type { createAuthClient } from "better-auth/solid"

export type ApiKeyAuthClient = ReturnType<
  typeof createAuthClient<{ plugins: [ReturnType<typeof apiKeyClient>] }>
>
