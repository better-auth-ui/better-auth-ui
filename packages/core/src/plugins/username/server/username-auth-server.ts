import type { Auth } from "better-auth"
import type { UsernamePlugin } from "better-auth/plugins"

export type UsernameAuthServer = Pick<
  Auth<{ plugins: [UsernamePlugin] }>,
  "api"
>
