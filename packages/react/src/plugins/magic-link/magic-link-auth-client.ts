import type { magicLinkClient } from "better-auth/client/plugins"
import type { createAuthClient } from "better-auth/react"

export type MagicLinkAuthClient = ReturnType<
  typeof createAuthClient<{ plugins: [ReturnType<typeof magicLinkClient>] }>
>
