import { createAuthPlugin } from "../../lib/create-auth-plugin"
import { type SsoLocalization, ssoLocalization } from "./sso-localization"

export type SsoPluginOptions = {
  /** Replace the standard sign-in form with email-first SSO discovery. @default true */
  emailFirst?: boolean
  /** Add organization-scoped SSO provider management. @default true */
  organization?: boolean
  /** Organization tab path. @default "sso" */
  path?: string
  /** Override the plugin's default localization strings. */
  localization?: Partial<SsoLocalization>
}

export const ssoPlugin = createAuthPlugin(
  "sso",
  (options: SsoPluginOptions = {}) => ({
    emailFirst: options.emailFirst ?? true,
    localization: { ...ssoLocalization, ...options.localization },
    organization: options.organization ?? true,
    path: options.path ?? "sso"
  })
)
