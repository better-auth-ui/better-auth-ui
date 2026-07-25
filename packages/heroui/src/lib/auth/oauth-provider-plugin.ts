import { createAuthPlugin } from "@better-auth-ui/core"
import {
  oauthProviderPlugin as coreOAuthProviderPlugin,
  type OAuthProviderPluginOptions
} from "@better-auth-ui/core/plugins"

import { OAuthConsent } from "../../components/auth/oauth-provider/oauth-consent"

export const oauthProviderPlugin = createAuthPlugin(
  coreOAuthProviderPlugin.id,
  (options: OAuthProviderPluginOptions = {}) => ({
    ...coreOAuthProviderPlugin(options),
    views: {
      auth: {
        oauthConsent: OAuthConsent
      }
    }
  })
)
