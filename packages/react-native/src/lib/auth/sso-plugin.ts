import {
  createAuthPlugin,
  type AuthPluginBase,
  type AuthPluginLocalizationContext
} from "@better-auth-ui/core"
import {
  ssoPlugin as coreSsoPlugin,
  type SsoPluginOptions,
  type SsoLocalization
} from "@better-auth-ui/core/plugins/sso"
import { EmailFirstSignIn } from "../../components/auth/sso/email-first-sign-in"
import { OrganizationSsoProviders } from "../../components/auth/sso/organization-sso-providers"

export const ssoPlugin = createAuthPlugin(
  coreSsoPlugin.id,
  (options: SsoPluginOptions = {}) => {
    const core = coreSsoPlugin(options)
    const tabs = (localization: SsoLocalization) =>
      core.organization
        ? {
            organizationTabs: [
              {
                id: "sso",
                path: core.path,
                label: localization.providerList,
                component: OrganizationSsoProviders
              }
            ]
          }
        : {}
    return {
      ...core,
      ...tabs(core.localization),
      ...(core.emailFirst && { views: { auth: { signIn: EmailFirstSignIn } } }),
      _localizationResolver: (
        plugin: AuthPluginBase,
        context: AuthPluginLocalizationContext
      ) => ({ ...plugin, ...tabs(context.localization as SsoLocalization) })
    }
  }
)
