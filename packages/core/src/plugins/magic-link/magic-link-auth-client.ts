import type { createAuthClient } from "better-auth/client"
import type { magicLinkClient } from "better-auth/client/plugins"
import type { OmitUseKeys } from "../../lib/auth-client"

export type MagicLinkAuthClient = OmitUseKeys<
  ReturnType<
    typeof createAuthClient<{ plugins: [ReturnType<typeof magicLinkClient>] }>
  >
>
