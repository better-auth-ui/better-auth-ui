import type { oauthProviderClient } from "@better-auth/oauth-provider/client"
import type { AuthClient } from "../../lib/auth-client"

export type OAuthProviderAuthClient = AuthClient<{
  plugins: [ReturnType<typeof oauthProviderClient>]
}>
