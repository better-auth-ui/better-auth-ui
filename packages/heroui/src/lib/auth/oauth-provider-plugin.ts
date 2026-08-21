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
import { Code } from "@gravity-ui/icons"
import { createElement } from "react"

import { AuthorizedApplications } from "../../components/auth/oauth-provider/authorized-applications"
import {
  OrganizationOAuthClients,
  UserOAuthClients
} from "../../components/auth/oauth-provider/oauth-clients"
import { OAuthConsent } from "../../components/auth/oauth-provider/oauth-consent"
import { OAuthSelectAccount } from "../../components/auth/oauth-provider/oauth-select-account"
import { OAuthSignUp } from "../../components/auth/oauth-provider/oauth-sign-up"

const clientManagementLabel = (label: string) =>
  createElement(
    "span",
    { className: "flex items-center gap-1" },
    createElement(Code, { className: "text-muted" }),
    label
  )

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
                label: clientManagementLabel(localization.oauthClients),
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
                label: clientManagementLabel(localization.oauthClients),
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
