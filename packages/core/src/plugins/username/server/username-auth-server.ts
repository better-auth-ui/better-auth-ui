import type { Auth } from "better-auth"
import type { username } from "better-auth/plugins"

export type UsernameAuthServer = Pick<
  Auth<{ plugins: [ReturnType<typeof username>] }>,
  "api"
>
