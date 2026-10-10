import {
  type AuthPluginBase,
  type AuthPluginLocalizationContext,
  createAuthPlugin
} from "@better-auth-ui/core"
import {
  oauthProviderPlugin as coreOAuthProviderPlugin,
  type OAuthProviderLocalization,
  type OAuthProviderPluginOptions
} from "@better-auth-ui/core/plugins/oauth-provider"

import { AuthorizedApplications } from "../../components/auth/oauth-provider/authorized-applications"
import {
  OrganizationOAuthClients,
  UserOAuthClients
} from "../../components/auth/oauth-provider/oauth-clients"
import { OAuthConsent } from "../../components/auth/oauth-provider/oauth-consent"
import { OAuthSelectAccount } from "../../components/auth/oauth-provider/oauth-select-account"
import { OAuthSignUp } from "../../components/auth/oauth-provider/oauth-sign-up"

export const oauthProviderPlugin = createAuthPlugin(
  coreOAuthProviderPlugin.id,
  (options: OAuthProviderPluginOptions = {}) => {
    const core = coreOAuthProviderPlugin(options)
    const localizedTabs = (localization: OAuthProviderLocalization) => ({
      ...(core.clientManagement
        ? {
            settingsTabs: [
              {
                view: "oauthClients" as const,
                label: localization.oauthClients,
                component: UserOAuthClients
              }
            ]
          }
        : {}),
      ...(core.organizationClientManager
        ? {
            organizationTabs: [
              {
                id: "oauthClients",
                path: options.clientManagementPath ?? "oauth-clients",
                label: localization.oauthClients,
                component: OrganizationOAuthClients
              }
            ]
          }
        : {})
    })

    return {
      ...core,
      views: {
        auth: {
          oauthConsent: OAuthConsent,
          // A route of its own rather than an override of the built-in
          // `signUp` view — ordinary sign-up stays untouched.
          oauthSignUp: OAuthSignUp,
          oauthSelectAccount: OAuthSelectAccount
        }
      },
      ...(core.showConnectedApplications
        ? { securityCards: [AuthorizedApplications] }
        : {}),
      ...localizedTabs(core.localization),
      _localizationResolver: (
        plugin: AuthPluginBase,
        context: AuthPluginLocalizationContext
      ) => ({
        ...plugin,
        ...localizedTabs(context.localization as OAuthProviderLocalization)
      })
    }
  }
)
