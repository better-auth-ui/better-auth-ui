import type { oauthProviderClient } from "@better-auth/oauth-provider/client"
import type { multiSessionClient } from "better-auth/client/plugins"
import type { AuthClient } from "../../lib/auth-client"

export type OAuthProviderAuthClient = AuthClient<{
  plugins: [ReturnType<typeof oauthProviderClient>]
}>

/**
 * Auth client typed with both plugins the OAuth account chooser needs.
 *
 * `oauthProviderClient()` forwards the signed authorization query and
 * `multiSessionClient()` lists and switches device sessions.
 */
export type OAuthProviderMultiSessionAuthClient = AuthClient<{
  plugins: [
    ReturnType<typeof oauthProviderClient>,
    ReturnType<typeof multiSessionClient>
  ]
}>
