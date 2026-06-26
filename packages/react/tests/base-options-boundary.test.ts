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

const baseParamExports = [
  "AccountInfoParams",
  "ChangeEmailParams",
  "ChangePasswordParams",
  "DeleteUserParams",
  "LinkSocialParams",
  "ListAccountsParams",
  "ListSessionsParams",
  "RequestPasswordResetParams",
  "ResetPasswordParams",
  "RevokeSessionParams",
  "SendVerificationEmailParams",
  "SignInEmailParams",
  "SignInSocialParams",
  "SignOutParams",
  "SignUpEmailParams",
  "UnlinkAccountParams",
  "UpdateUserParams"
] as const

describe("React base option factory ownership", () => {
  it("exports base option factories from core, not the React package", () => {
    for (const name of baseOptionFactories) {
      expect(core).toHaveProperty(name)
      expect(react).not.toHaveProperty(name)
    }
  })

  it("keeps settings query hooks public without publishing core factories", () => {
    expect(react).toHaveProperty("useAccountInfo")
    expect(react).toHaveProperty("useListAccounts")
    expect(react).toHaveProperty("useListSessions")
    expect(react).not.toHaveProperty("authQueryOptions")
  })

  it("does not publish core-owned params from the React root at runtime", () => {
    for (const name of baseParamExports) {
      expect(react).not.toHaveProperty(name)
    }
  })
})
