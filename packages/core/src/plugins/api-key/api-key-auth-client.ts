import type { apiKeyClient } from "@better-auth/api-key/client"
import type { createAuthClient } from "better-auth/client"
import type { OmitUseAndStoreKeys } from "../../lib/auth-client"

export type ApiKeyAuthClient = OmitUseAndStoreKeys<
  ReturnType<
    typeof createAuthClient<{ plugins: [ReturnType<typeof apiKeyClient>] }>
  >
>
