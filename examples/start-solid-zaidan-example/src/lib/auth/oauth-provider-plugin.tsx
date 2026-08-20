import { createAuthPlugin } from "@better-auth-ui/core"
import {
  oauthProviderPlugin as coreOAuthProviderPlugin,
  type OAuthProviderPluginOptions
} from "@better-auth-ui/core/plugins/oauth-provider"
import { Code2 } from "lucide-solid"

import { AuthorizedApplications } from "@/components/auth/oauth-provider/authorized-applications"
import {
  OrganizationOAuthClients,
  UserOAuthClients
} from "@/components/auth/oauth-provider/oauth-clients"
import { OAuthConsent } from "@/components/auth/oauth-provider/oauth-consent"
import { OAuthSelectAccount } from "@/components/auth/oauth-provider/oauth-select-account"
import { OAuthSignUp } from "@/components/auth/oauth-provider/oauth-sign-up"
import type { SolidSettingsTab } from "@/lib/auth/organization-plugin"

export const oauthProviderPlugin = createAuthPlugin(
  coreOAuthProviderPlugin.id,
  (options: OAuthProviderPluginOptions = {}) => {
    const core = coreOAuthProviderPlugin(options)

    const ClientManagementLabel = () => (
      <span class="inline-flex items-center gap-1">
        <Code2 class="size-4 text-muted-foreground" />
        {core.localization.oauthClients}
      </span>
    )

    return {
      ...core,
      views: {
        auth: {
          oauthConsent: OAuthConsent,
          // A route of its own rather than an override of the built-in
          // `signUp` view. Ordinary sign-up stays untouched.
          oauthSignUp: OAuthSignUp,
          oauthSelectAccount: OAuthSelectAccount
        }
      },
      ...(core.showConnectedApplications
        ? { securityCards: [AuthorizedApplications] }
        : {}),
      ...(core.clientManagement
        ? {
            settingsTabs: [
              {
                view: "oauthClients",
                tabLabel: ClientManagementLabel,
                component: UserOAuthClients
              }
            ] satisfies SolidSettingsTab[]
          }
        : {}),
      ...(core.organizationClientManager
        ? {
            organizationTabs: [
              {
                id: "oauthClients",
                path: options.clientManagementPath ?? "oauth-clients",
                label: ClientManagementLabel,
                component: OrganizationOAuthClients
              }
            ]
          }
        : {})
    }
  }
)
