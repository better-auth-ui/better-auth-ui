import * as core from "@better-auth-ui/core"
import { describe, expect, expectTypeOf, it } from "vitest"
import type {
  AccountInfoParams,
  ChangeEmailParams,
  ChangePasswordParams,
  DeleteUserParams,
  LinkSocialParams,
  ListAccountsParams,
  ListSessionsParams,
  RequestPasswordResetParams,
  ResetPasswordParams,
  RevokeSessionParams,
  SendVerificationEmailParams,
  SignInEmailParams,
  SignInSocialParams,
  SignOutParams,
  SignUpEmailParams,
  UnlinkAccountParams,
  UpdateUserParams
} from "../src"
import * as react from "../src"

type PublicReactParamExports = [
  AccountInfoParams<core.AuthClient>,
  ChangeEmailParams<core.AuthClient>,
  ChangePasswordParams<core.AuthClient>,
  DeleteUserParams<core.AuthClient>,
  LinkSocialParams<core.AuthClient>,
  ListAccountsParams<core.AuthClient>,
  ListSessionsParams<core.AuthClient>,
  RequestPasswordResetParams<core.AuthClient>,
  ResetPasswordParams<core.AuthClient>,
  RevokeSessionParams<core.AuthClient>,
  SendVerificationEmailParams<core.AuthClient>,
  SignInEmailParams<core.AuthClient>,
  SignInSocialParams<core.AuthClient>,
  SignOutParams<core.AuthClient>,
  SignUpEmailParams<core.AuthClient>,
  UnlinkAccountParams<core.AuthClient>,
  UpdateUserParams<core.AuthClient>
]

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

  it("keeps settings query hooks public without publishing core factories", () => {
    expect(react).toHaveProperty("useAccountInfo")
    expect(react).toHaveProperty("useListAccounts")
    expect(react).toHaveProperty("useListSessions")
    expect(react).not.toHaveProperty("authQueryOptions")
  })

  it("keeps public base params type exports available", () => {
    expectTypeOf<PublicReactParamExports>().toEqualTypeOf<PublicReactParamExports>()
  })
})
