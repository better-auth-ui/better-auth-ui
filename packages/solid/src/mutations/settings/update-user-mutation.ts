import { authMutationKeys } from "@better-auth-ui/core"
import type { AuthClient } from "../../lib/auth-client"
import { createAuthMutationOptions } from "../create-auth-mutation"

export type UpdateUserParams<TAuthClient extends AuthClient> = Parameters<
  TAuthClient["updateUser"]
>[0]

export function updateUserOptions<TAuthClient extends AuthClient>(
  authClient: TAuthClient
) {
  return createAuthMutationOptions(
    authClient.updateUser,
    authMutationKeys.updateUser
  )
}
