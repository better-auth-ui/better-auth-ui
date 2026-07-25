import type { lastLoginMethodClient } from "better-auth/client/plugins"
import type { AuthClient } from "../../lib/auth-client"

export type LastLoginMethodAuthClient = AuthClient<{
  plugins: [ReturnType<typeof lastLoginMethodClient>]
}>
