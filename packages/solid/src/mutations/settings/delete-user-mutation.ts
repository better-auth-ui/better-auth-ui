import { deleteUserMutationKeys } from "@better-auth-ui/core/plugins/delete-user"
import type { AuthClient } from "../../lib/auth-client"
import { createAuthMutationOptions } from "../create-auth-mutation"

export type DeleteUserParams<TAuthClient extends AuthClient> = Parameters<
  TAuthClient["deleteUser"]
>[0]

export function deleteUserOptions<TAuthClient extends AuthClient>(
  authClient: TAuthClient
) {
  return createAuthMutationOptions(
    authClient.deleteUser,
    deleteUserMutationKeys.deleteUser
  )
}
