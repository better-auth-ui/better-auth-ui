import * as core from "@better-auth-ui/core"
import { describe, expect, it } from "vitest"
import * as react from "../src"

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

describe("React base option factory ownership", () => {
  it("exports base option factories from core, not the React package", () => {
    for (const name of baseOptionFactories) {
      expect(core).toHaveProperty(name)
      expect(react).not.toHaveProperty(name)
    }
  })
})
