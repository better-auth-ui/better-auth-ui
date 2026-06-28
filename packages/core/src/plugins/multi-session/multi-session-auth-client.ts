import type { multiSessionClient } from "better-auth/client/plugins"
import type { AuthClient } from "../../lib/auth-client"

export type MultiSessionAuthClient = AuthClient<{
  plugins: [ReturnType<typeof multiSessionClient>]
}>
