import { createAuthPlugin } from "../../lib/create-auth-plugin"
import { type SsoLocalization, ssoLocalization } from "./sso-localization"

export type SsoPluginOptions = {
  /** Replace the standard sign-in form with email-first SSO discovery. @default true */
  emailFirst?: boolean
  /** Override the plugin's default localization strings. */
  localization?: Partial<SsoLocalization>
}

export const ssoPlugin = createAuthPlugin(
  "sso",
  (options: SsoPluginOptions = {}) => ({
    emailFirst: options.emailFirst ?? true,
    localization: { ...ssoLocalization, ...options.localization }
  })
)
