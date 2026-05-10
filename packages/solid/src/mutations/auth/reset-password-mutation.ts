import { authMutationKeys } from "@better-auth-ui/core"
import type { AuthClient } from "../../lib/auth-client"
import { createAuthMutationOptions } from "../create-auth-mutation"

export type ResetPasswordParams<TAuthClient extends AuthClient> = Parameters<
  TAuthClient["resetPassword"]
>[0]

export function resetPasswordOptions<TAuthClient extends AuthClient>(
  authClient: TAuthClient
) {
  return createAuthMutationOptions(
    authClient.resetPassword,
    authMutationKeys.resetPassword
  )
}
