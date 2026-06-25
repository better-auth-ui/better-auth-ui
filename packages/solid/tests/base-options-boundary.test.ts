import * as core from "@better-auth-ui/core"
import { describe, expect, it } from "vitest"
import * as solid from "../src"

const baseOptionFactories = [
  "accountInfoOptions",
  "listAccountsOptions",
  "listSessionsOptions",
  "requestPasswordResetOptions",
  "resetPasswordOptions",
  "sendVerificationEmailOptions",
  "signInEmailOptions",
  "signInSocialOptions",
  "signOutOptions",
  "signUpEmailOptions",
  "changeEmailOptions",
  "changePasswordOptions",
  "deleteUserOptions",
  "linkSocialOptions",
  "revokeSessionOptions",
  "unlinkAccountOptions",
  "updateUserOptions"
] as const

const pluginOptionFactories = [
  "createApiKeyOptions",
  "deleteApiKeyOptions",
  "signInMagicLinkOptions",
  "revokeMultiSessionOptions",
  "setActiveSessionOptions"
] as const

const coreQueryHelpers = [
  "ensureAccountInfo",
  "prefetchAccountInfo",
  "fetchAccountInfo",
  "ensureListAccounts",
  "prefetchListAccounts",
  "fetchListAccounts",
  "ensureListSessions",
  "prefetchListSessions",
  "fetchListSessions"
] as const

describe("Solid base option factory ownership", () => {
  it("exports base option factories from core, not the Solid package", () => {
    for (const name of baseOptionFactories) {
      expect(core).toHaveProperty(name)
      expect(solid).not.toHaveProperty(name)
    }
  })

  it("does not expose core-owned plugin option factories from the Solid package root", () => {
    for (const name of pluginOptionFactories) {
      expect(solid).not.toHaveProperty(name)
    }
  })

  it("does not expose core-owned settings query helpers from the Solid package root", () => {
    for (const name of coreQueryHelpers) {
      expect(core).toHaveProperty(name)
      expect(solid).not.toHaveProperty(name)
    }
  })

  it("does not expose createAuthMutation from the Solid package root", () => {
    expect(solid).not.toHaveProperty("createAuthMutation")
  })
})
