import type { usernameClient } from "better-auth/client/plugins"
import type { AuthClient } from "../../lib/auth-client"

export type UsernameAuthClient = AuthClient<{
  plugins: [ReturnType<typeof usernameClient>]
}>
