import type { Auth } from "better-auth"
import type { multiSession } from "better-auth/plugins"

export type MultiSessionAuthServer = Pick<
  Auth<{ plugins: [ReturnType<typeof multiSession>] }>,
  "api"
>
