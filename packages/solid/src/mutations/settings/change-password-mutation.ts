import { authMutationKeys } from "@better-auth-ui/core"
import type { AuthClient } from "../../lib/auth-client"
import { createAuthMutationOptions } from "../create-auth-mutation"

export type ChangePasswordParams<TAuthClient extends AuthClient> = Parameters<
  TAuthClient["changePassword"]
>[0]

export function changePasswordOptions<TAuthClient extends AuthClient>(
  authClient: TAuthClient
) {
  return createAuthMutationOptions(
    authClient.changePassword,
    authMutationKeys.changePassword
  )
}
