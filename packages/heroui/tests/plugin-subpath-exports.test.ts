import { describe, expect, it } from "vitest"
import * as agentAuth from "../src/plugins/agent-auth"
import * as apiKey from "../src/plugins/api-key"
import * as billing from "../src/plugins/billing"
import * as dash from "../src/plugins/dash"
import * as deleteUser from "../src/plugins/delete-user"
import * as emailOtp from "../src/plugins/email-otp"
import * as magicLink from "../src/plugins/magic-link"
import * as multiSession from "../src/plugins/multi-session"
import * as organization from "../src/plugins/organization"
import * as passkey from "../src/plugins/passkey"
import * as siwe from "../src/plugins/siwe"
import * as sso from "../src/plugins/sso"
import * as theme from "../src/plugins/theme"
import * as twoFactor from "../src/plugins/two-factor"
import * as username from "../src/plugins/username"

describe("HeroUI plugin subpath exports", () => {
  it("publishes plugin-specific components and plugin factories from scoped entrypoints", () => {
    expect(agentAuth).toHaveProperty("AgentApproval")
    expect(agentAuth).toHaveProperty("AgentAuthorizations")
    expect(agentAuth).toHaveProperty("agentAuthPlugin")
    expect(apiKey).toHaveProperty("ApiKeys")
    expect(apiKey).toHaveProperty("OrganizationApiKeys")
    expect(apiKey).toHaveProperty("apiKeyPlugin")

    expect(billing).toHaveProperty("BillingSettings")
    expect(billing).toHaveProperty("UserBillingSettings")
    expect(billing).toHaveProperty("OrganizationBillingSettings")
    expect(billing).toHaveProperty("billingPlugin")

    expect(dash).toHaveProperty("UserActivity")
    expect(dash).toHaveProperty("OrganizationActivity")
    expect(dash).toHaveProperty("dashPlugin")

    expect(deleteUser).toHaveProperty("DangerZone")
    expect(deleteUser).toHaveProperty("DeleteAccount")
    expect(deleteUser).toHaveProperty("deleteUserPlugin")

    expect(emailOtp).toHaveProperty("EmailOtp")
    expect(emailOtp).toHaveProperty("VerifyEmailOtp")
    expect(emailOtp).toHaveProperty("emailOtpPlugin")

    expect(magicLink).toHaveProperty("MagicLink")
    expect(magicLink).toHaveProperty("magicLinkPlugin")

    expect(multiSession).toHaveProperty("ManageAccounts")
    expect(multiSession).toHaveProperty("SwitchAccountSubmenu")
    expect(multiSession).toHaveProperty("multiSessionPlugin")

    expect(organization).toHaveProperty("OrganizationSwitcher")
    expect(organization).toHaveProperty("OrganizationSettings")
    expect(organization).toHaveProperty("organizationPlugin")

    expect(passkey).toHaveProperty("PasskeyButton")
    expect(passkey).toHaveProperty("Passkeys")
    expect(passkey).toHaveProperty("passkeyPlugin")

    expect(sso).toHaveProperty("EmailFirstSignIn")
    expect(sso).toHaveProperty("ssoPlugin")

    expect(siwe).toHaveProperty("SignInEthereumButton")
    expect(siwe).toHaveProperty("WalletAccounts")
    expect(siwe).toHaveProperty("siwePlugin")

    expect(theme).toHaveProperty("Appearance")
    expect(theme).toHaveProperty("ThemeToggleItem")
    expect(theme).toHaveProperty("themePlugin")

    expect(twoFactor).toHaveProperty("TwoFactorChallenge")
    expect(twoFactor).toHaveProperty("TwoFactorSettings")
    expect(twoFactor).toHaveProperty("twoFactorPlugin")

    expect(username).toHaveProperty("SignInUsername")
    expect(username).toHaveProperty("UsernameField")
    expect(username).toHaveProperty("usernamePlugin")
  })

  it("keeps PasskeyButton scoped to the passkey subpath", async () => {
    const aggregate = await import("../src/plugins")

    expect(passkey).toHaveProperty("PasskeyButton")
    expect(aggregate).not.toHaveProperty("PasskeyButton")
  })
})
