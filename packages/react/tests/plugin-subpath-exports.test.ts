import { describe, expect, it } from "vitest"
import * as apiKey from "../src/plugins/api-key"
import * as captcha from "../src/plugins/captcha"
import * as magicLink from "../src/plugins/magic-link"
import * as multiSession from "../src/plugins/multi-session"
import * as organization from "../src/plugins/organization"
import * as passkey from "../src/plugins/passkey"
import * as username from "../src/plugins/username"

describe("React plugin subpath exports", () => {
  it("publishes plugin-specific hooks and queries from plugin-scoped entrypoints", () => {
    expect(apiKey).toHaveProperty("useCreateApiKey")
    expect(apiKey).toHaveProperty("useDeleteApiKey")
    expect(apiKey).toHaveProperty("useListApiKeys")

    expect(passkey).toHaveProperty("useAddPasskey")
    expect(passkey).toHaveProperty("useDeletePasskey")
    expect(passkey).toHaveProperty("useSignInPasskey")
    expect(passkey).toHaveProperty("useListPasskeys")

    expect(multiSession).toHaveProperty("useRevokeMultiSession")
    expect(multiSession).toHaveProperty("useSetActiveSession")
    expect(multiSession).toHaveProperty("useListDeviceSessions")

    expect(captcha).toHaveProperty("captchaPlugin")
    expect(magicLink).toHaveProperty("useSignInMagicLink")
    expect(username).toHaveProperty("useIsUsernameAvailable")
    expect(username).toHaveProperty("useSignInUsername")

    expect(organization).toHaveProperty("useAcceptInvitation")
    expect(organization).toHaveProperty("useCancelInvitation")
    expect(organization).toHaveProperty("useActiveOrganization")
    expect(organization).toHaveProperty("useListOrganizations")
  })

  it("keeps core-owned mutation factories out of framework plugin entrypoints", () => {
    expect(apiKey).not.toHaveProperty("createApiKeyOptions")
    expect(apiKey).not.toHaveProperty("deleteApiKeyOptions")
    expect(magicLink).not.toHaveProperty("signInMagicLinkOptions")
    expect(multiSession).not.toHaveProperty("revokeMultiSessionOptions")
    expect(multiSession).not.toHaveProperty("setActiveSessionOptions")
    expect(passkey).not.toHaveProperty("addPasskeyOptions")
    expect(passkey).not.toHaveProperty("deletePasskeyOptions")
    expect(passkey).not.toHaveProperty("signInPasskeyOptions")
    expect(username).not.toHaveProperty("signInUsernameOptions")
    expect(username).not.toHaveProperty("isUsernameAvailableOptions")
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

    expect(react).not.toHaveProperty("useAddPasskey")
    expect(react).not.toHaveProperty("useCancelInvitation")
    expect(react).not.toHaveProperty("useListApiKeys")
    expect(react).not.toHaveProperty("useListPasskeys")
  })
})
