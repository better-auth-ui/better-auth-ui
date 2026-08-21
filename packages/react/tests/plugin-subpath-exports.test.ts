import { describe, expect, it } from "vitest"
import * as admin from "../src/plugins/admin"
import * as agentAuth from "../src/plugins/agent-auth"
import * as anonymous from "../src/plugins/anonymous"
import * as apiKey from "../src/plugins/api-key"
import * as billing from "../src/plugins/billing"
import * as captcha from "../src/plugins/captcha"
import * as dash from "../src/plugins/dash"
import * as deviceAuthorization from "../src/plugins/device-authorization"
import * as emailOtp from "../src/plugins/email-otp"
import * as magicLink from "../src/plugins/magic-link"
import * as multiSession from "../src/plugins/multi-session"
import * as oauthProvider from "../src/plugins/oauth-provider"
import * as oneTap from "../src/plugins/one-tap"
import * as organization from "../src/plugins/organization"
import * as passkey from "../src/plugins/passkey"
import * as phoneNumber from "../src/plugins/phone-number"
import * as siwe from "../src/plugins/siwe"
import * as sso from "../src/plugins/sso"
import * as twoFactor from "../src/plugins/two-factor"
import * as username from "../src/plugins/username"

describe("React plugin subpath exports", () => {
  it("publishes plugin-specific hooks and queries from plugin-scoped entrypoints", () => {
    expect(agentAuth).toHaveProperty("useAgentApproval")
    expect(agentAuth).toHaveProperty("useAgentAuthorizations")
    expect(agentAuth).toHaveProperty("useApproveAgent")
    expect(agentAuth).toHaveProperty("useDenyAgent")
    expect(agentAuth).toHaveProperty("useRevokeAgentCapability")
    expect(apiKey).toHaveProperty("useCreateApiKey")
    expect(apiKey).toHaveProperty("useDeleteApiKey")
    expect(apiKey).toHaveProperty("useUpdateApiKey")
    expect(apiKey).toHaveProperty("useListApiKeys")
    expect(billing).toHaveProperty("useBillingPlans")
    expect(billing).toHaveProperty("useBillingState")
    expect(billing).toHaveProperty("useBillingCheckout")
    expect(billing).toHaveProperty("useBillingPortal")
    expect(billing).toHaveProperty("useCancelBillingSubscription")
    expect(billing).toHaveProperty("useRestoreBillingSubscription")
    expect(billing).toHaveProperty("useUpdateBillingSeats")
    expect(dash).toHaveProperty("useDashAuditLogs")
    expect(dash).toHaveProperty("useDashAllAuditLogs")

    expect(passkey).toHaveProperty("useAddPasskey")
    expect(passkey).toHaveProperty("useDeletePasskey")
    expect(passkey).toHaveProperty("useUpdatePasskey")
    expect(passkey).toHaveProperty("useSignInPasskey")
    expect(passkey).toHaveProperty("useListPasskeys")

    expect(phoneNumber).toHaveProperty("useRequestPhoneNumberPasswordReset")
    expect(phoneNumber).toHaveProperty("useResetPhoneNumberPassword")
    expect(phoneNumber).toHaveProperty("useSendPhoneNumberOtp")
    expect(phoneNumber).toHaveProperty("useSignInPhoneNumber")
    expect(phoneNumber).toHaveProperty("useVerifyPhoneNumber")
    expect(sso).toHaveProperty("useSignInSso")
    expect(siwe).toHaveProperty("useSignInSiwe")
    expect(siwe).toHaveProperty("useSiweWallets")
    expect(siwe).toHaveProperty("useLinkSiweWallet")
    expect(siwe).toHaveProperty("useUnlinkSiweWallet")
    expect(siwe).toHaveProperty("useSetPrimarySiweWallet")

    expect(multiSession).toHaveProperty("useRevokeMultiSession")
    expect(multiSession).toHaveProperty("useSetActiveSession")
    expect(multiSession).toHaveProperty("useListDeviceSessions")

    expect(captcha).toHaveProperty("captchaPlugin")
    expect(anonymous).toHaveProperty("useSignInAnonymous")
    expect(oneTap).toHaveProperty("oneTapPlugin")
    expect(oneTap).toHaveProperty("usePromptOneTap")
    expect(admin).toHaveProperty("useStopImpersonating")
    expect(deviceAuthorization).toHaveProperty("useApproveDevice")
    expect(deviceAuthorization).toHaveProperty("useDenyDevice")
    expect(deviceAuthorization).toHaveProperty("useVerifyDeviceCode")
    expect(emailOtp).toHaveProperty("useChangeEmailOtp")
    expect(emailOtp).toHaveProperty("useSignInEmailOtp")
    expect(emailOtp).toHaveProperty("useVerifyEmailOtp")
    expect(magicLink).toHaveProperty("useSignInMagicLink")
    expect(oauthProvider).toHaveProperty("useOAuthConsent")
    expect(oauthProvider).toHaveProperty("useOAuthClients")
    expect(oauthProvider).toHaveProperty("useCreateOAuthClient")
    expect(oauthProvider).toHaveProperty("useRotateOAuthClientSecret")
    expect(oauthProvider).toHaveProperty("usePublicOAuthClient")
    expect(username).toHaveProperty("useIsUsernameAvailable")
    expect(username).toHaveProperty("useSignInUsername")
    expect(twoFactor).toHaveProperty("useDisableTwoFactor")
    expect(twoFactor).toHaveProperty("useEnableTwoFactor")
    expect(twoFactor).toHaveProperty("useVerifyTotp")

    expect(organization).toHaveProperty("useAcceptInvitation")
    expect(organization).toHaveProperty("useCancelInvitation")
    expect(organization).toHaveProperty("useActiveOrganization")
    expect(organization).toHaveProperty("useListOrganizations")
    expect(organization).toHaveProperty("useListTeams")
    expect(organization).toHaveProperty("useListUserTeams")
    expect(organization).toHaveProperty("useListTeamMembers")
    expect(organization).toHaveProperty("useCreateTeam")
    expect(organization).toHaveProperty("useUpdateTeam")
    expect(organization).toHaveProperty("useRemoveTeam")
    expect(organization).toHaveProperty("useAddTeamMember")
    expect(organization).toHaveProperty("useRemoveTeamMember")
    expect(organization).toHaveProperty("useSetActiveTeam")
    expect(organization).toHaveProperty("useListRoles")
    expect(organization).toHaveProperty("useRole")
    expect(organization).toHaveProperty("useCreateRole")
    expect(organization).toHaveProperty("useUpdateRole")
    expect(organization).toHaveProperty("useDeleteRole")
  })

  it("keeps core-owned mutation factories out of framework plugin entrypoints", () => {
    expect(agentAuth).not.toHaveProperty("approveAgentOptions")
    expect(apiKey).not.toHaveProperty("createApiKeyOptions")
    expect(billing).not.toHaveProperty("billingPlansOptions")
    expect(billing).not.toHaveProperty("billingCheckoutOptions")
    expect(dash).not.toHaveProperty("dashAuditLogsOptions")
    expect(anonymous).not.toHaveProperty("signInAnonymousOptions")
    expect(oneTap).not.toHaveProperty("promptOneTapOptions")
    expect(admin).not.toHaveProperty("stopImpersonatingOptions")
    expect(deviceAuthorization).not.toHaveProperty("approveDeviceOptions")
    expect(deviceAuthorization).not.toHaveProperty("denyDeviceOptions")
    expect(deviceAuthorization).not.toHaveProperty("verifyDeviceCodeOptions")
    expect(emailOtp).not.toHaveProperty("changeEmailOtpOptions")
    expect(emailOtp).not.toHaveProperty("signInEmailOtpOptions")
    expect(apiKey).not.toHaveProperty("deleteApiKeyOptions")
    expect(magicLink).not.toHaveProperty("signInMagicLinkOptions")
    expect(multiSession).not.toHaveProperty("revokeMultiSessionOptions")
    expect(multiSession).not.toHaveProperty("setActiveSessionOptions")
    expect(oauthProvider).not.toHaveProperty("oauthConsentOptions")
    expect(oauthProvider).not.toHaveProperty("publicOAuthClientOptions")
    expect(passkey).not.toHaveProperty("addPasskeyOptions")
    expect(passkey).not.toHaveProperty("deletePasskeyOptions")
    expect(passkey).not.toHaveProperty("signInPasskeyOptions")
    expect(phoneNumber).not.toHaveProperty(
      "requestPhoneNumberPasswordResetOptions"
    )
    expect(phoneNumber).not.toHaveProperty("resetPhoneNumberPasswordOptions")
    expect(phoneNumber).not.toHaveProperty("sendPhoneNumberOtpOptions")
    expect(phoneNumber).not.toHaveProperty("signInPhoneNumberOptions")
    expect(phoneNumber).not.toHaveProperty("verifyPhoneNumberOptions")
    expect(sso).not.toHaveProperty("signInSsoOptions")
    expect(siwe).not.toHaveProperty("signInSiweOptions")
    expect(username).not.toHaveProperty("signInUsernameOptions")
    expect(username).not.toHaveProperty("isUsernameAvailableOptions")
    expect(twoFactor).not.toHaveProperty("enableTwoFactorOptions")
    expect(twoFactor).not.toHaveProperty("verifyTotpOptions")
    expect(organization).not.toHaveProperty("createOrganizationOptions")
    expect(organization).not.toHaveProperty("setActiveOrganizationOptions")
    expect(apiKey).not.toHaveProperty("listApiKeysOptions")
    expect(multiSession).not.toHaveProperty("listDeviceSessionsOptions")
    expect(passkey).not.toHaveProperty("listPasskeysOptions")
    expect(organization).not.toHaveProperty("activeOrganizationOptions")
    expect(organization).not.toHaveProperty("listOrganizationsOptions")
    expect(organization).not.toHaveProperty("hasPermissionOptions")
    expect(organization).not.toHaveProperty("metadata")
  })

  it("does not publish plugin-specific APIs from the root entrypoint", async () => {
    const react = await import("../src")

    expect(react).not.toHaveProperty("useAgentApproval")
    expect(react).not.toHaveProperty("useAgentAuthorizations")
    expect(react).not.toHaveProperty("useApproveAgent")
    expect(react).not.toHaveProperty("useDenyAgent")
    expect(react).not.toHaveProperty("useRevokeAgentCapability")
    expect(react).not.toHaveProperty("useAddPasskey")
    expect(react).not.toHaveProperty("useSignInAnonymous")
    expect(react).not.toHaveProperty("oneTapPlugin")
    expect(react).not.toHaveProperty("useCancelInvitation")
    expect(react).not.toHaveProperty("useListApiKeys")
    expect(react).not.toHaveProperty("useBillingState")
    expect(react).not.toHaveProperty("useDashAuditLogs")
    expect(react).not.toHaveProperty("useListPasskeys")
    expect(react).not.toHaveProperty("useSignInEmailOtp")
    expect(react).not.toHaveProperty("useOAuthConsent")
    expect(react).not.toHaveProperty("useStopImpersonating")
    expect(react).not.toHaveProperty("useVerifyTotp")
    expect(react).not.toHaveProperty("useVerifyPhoneNumber")
  })
})
