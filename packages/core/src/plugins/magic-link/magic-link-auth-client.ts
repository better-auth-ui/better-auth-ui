import type { createAuthClient } from "better-auth/client"
import type { magicLinkClient } from "better-auth/client/plugins"
import type { OmitUseAndStoreKeys } from "../../lib/auth-client"

export type MagicLinkAuthClient = OmitUseAndStoreKeys<
  ReturnType<
    typeof createAuthClient<{ plugins: [ReturnType<typeof magicLinkClient>] }>
  >
>
