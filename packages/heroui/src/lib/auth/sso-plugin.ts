import {
  type AuthPluginBase,
  type AuthPluginLocalizationContext,
  createAuthPlugin
} from "@better-auth-ui/core"
import {
  ssoPlugin as coreSsoPlugin,
  type SsoLocalization,
  type SsoPluginOptions
} from "@better-auth-ui/core/plugins/sso"
import { ShieldCheck } from "@gravity-ui/icons"
import { createElement } from "react"

import { EmailFirstSignIn } from "../../components/auth/sso/email-first-sign-in"
import { OrganizationSsoProviders } from "../../components/auth/sso/organization-sso-providers"

export const ssoPlugin = createAuthPlugin(
  coreSsoPlugin.id,
  (options: SsoPluginOptions = {}) => {
    const plugin = coreSsoPlugin(options)
    const localizedOrganizationTab = (localization: SsoLocalization) =>
      plugin.organization
        ? {
            organizationTabs: [
              {
                id: "sso",
                path: plugin.path,
                label: createElement(
                  "span",
                  { className: "inline-flex items-center gap-1" },
                  createElement(ShieldCheck, {
                    "aria-hidden": true,
                    className: "text-muted"
                  }),
                  localization.providerList
                ),
                component: OrganizationSsoProviders
              }
            ]
          }
        : {}

    return {
      ...plugin,
      ...localizedOrganizationTab(plugin.localization),
      ...(plugin.emailFirst && {
        views: { auth: { signIn: EmailFirstSignIn } }
      }),
      _localizationResolver: (
        resolvedPlugin: AuthPluginBase,
        context: AuthPluginLocalizationContext
      ) => ({
        ...resolvedPlugin,
        // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- the resolver receives this plugin's resolved localization
        ...localizedOrganizationTab(context.localization as SsoLocalization)
      })
    }
  }
)
