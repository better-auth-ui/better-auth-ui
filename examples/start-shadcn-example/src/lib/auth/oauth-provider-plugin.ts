import { createAuthPlugin } from "@better-auth-ui/core"
import {
  oauthProviderPlugin as coreOAuthProviderPlugin,
  type OAuthProviderPluginOptions
} from "@better-auth-ui/core/plugins"

import { AuthorizedApplications } from "@/components/auth/oauth-provider/authorized-applications"
import { OAuthConsent } from "@/components/auth/oauth-provider/oauth-consent"
import { OAuthSelectAccount } from "@/components/auth/oauth-provider/oauth-select-account"
import { OAuthSignUp } from "@/components/auth/oauth-provider/oauth-sign-up"

export const oauthProviderPlugin = createAuthPlugin(
  coreOAuthProviderPlugin.id,
  (options: OAuthProviderPluginOptions = {}) => {
    const core = coreOAuthProviderPlugin(options)

    return {
      ...core,
      views: {
        auth: {
          // Overrides the built-in sign-up view so `prompt=create` requests
          // can resume the authorization once the account exists.
          signUp: OAuthSignUp,
          oauthConsent: OAuthConsent,
          oauthSelectAccount: OAuthSelectAccount
        }
      },
      ...(core.showConnectedApplications
        ? { securityCards: [AuthorizedApplications] }
        : {})
    }
  }
)
