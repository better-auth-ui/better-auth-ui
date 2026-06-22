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

describe("Solid base option factory ownership", () => {
  it("exports base option factories from core, not the Solid package", () => {
    for (const name of baseOptionFactories) {
      expect(core).toHaveProperty(name)
      expect(solid).not.toHaveProperty(name)
    }
  })
})
