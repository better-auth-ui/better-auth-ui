import { adminLocalization } from "@better-auth-ui/core/plugins/admin"
import { agentAuthLocalization } from "@better-auth-ui/core/plugins/agent-auth"
import { anonymousLocalization } from "@better-auth-ui/core/plugins/anonymous"
import { apiKeyLocalization } from "@better-auth-ui/core/plugins/api-key"
import { billingLocalization } from "@better-auth-ui/core/plugins/billing"
import { dashLocalization } from "@better-auth-ui/core/plugins/dash"
import { deleteUserLocalization } from "@better-auth-ui/core/plugins/delete-user"
import { deviceAuthorizationLocalization } from "@better-auth-ui/core/plugins/device-authorization"
import { emailOtpLocalization } from "@better-auth-ui/core/plugins/email-otp"
import { lastLoginMethodLocalization } from "@better-auth-ui/core/plugins/last-login-method"
import { magicLinkLocalization } from "@better-auth-ui/core/plugins/magic-link"
import { multiSessionLocalization } from "@better-auth-ui/core/plugins/multi-session"
import { oauthProviderLocalization } from "@better-auth-ui/core/plugins/oauth-provider"
import { organizationLocalization } from "@better-auth-ui/core/plugins/organization"
import { passkeyLocalization } from "@better-auth-ui/core/plugins/passkey"
import { phoneNumberLocalization } from "@better-auth-ui/core/plugins/phone-number"
import { siweLocalization } from "@better-auth-ui/core/plugins/siwe"
import { ssoLocalization } from "@better-auth-ui/core/plugins/sso"
import { themeLocalization } from "@better-auth-ui/core/plugins/theme"
import { twoFactorLocalization } from "@better-auth-ui/core/plugins/two-factor"
import { usernameLocalization } from "@better-auth-ui/core/plugins/username"

export const enUSPlugins = {
  admin: adminLocalization,
  agentAuth: agentAuthLocalization,
  anonymous: anonymousLocalization,
  apiKey: apiKeyLocalization,
  billing: billingLocalization,
  dash: dashLocalization,
  deleteUser: deleteUserLocalization,
  deviceAuthorization: deviceAuthorizationLocalization,
  emailOtp: emailOtpLocalization,
  lastLoginMethod: lastLoginMethodLocalization,
  magicLink: magicLinkLocalization,
  multiSession: multiSessionLocalization,
  oauthProvider: oauthProviderLocalization,
  organization: organizationLocalization,
  passkey: passkeyLocalization,
  phoneNumber: phoneNumberLocalization,
  siwe: siweLocalization,
  sso: ssoLocalization,
  theme: themeLocalization,
  twoFactor: twoFactorLocalization,
  username: usernameLocalization
}
