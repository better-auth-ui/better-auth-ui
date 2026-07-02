import type { Auth } from "better-auth"
import type { magicLink } from "better-auth/plugins"

export type MagicLinkAuthServer = Pick<
  Auth<{ plugins: [ReturnType<typeof magicLink>] }>,
  "api"
>
