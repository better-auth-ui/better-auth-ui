import {
  type AuthClient,
  type DeleteUserOptions,
  deleteUserOptions
} from "@better-auth-ui/core"
import { useMutation } from "@tanstack/solid-query"

export type { DeleteUserParams } from "@better-auth-ui/core"

export function useDeleteUser<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options?: DeleteUserOptions<TAuthClient>
) {
  return useMutation(() => ({
    ...deleteUserOptions(authClient),
    ...options
  }))
}
export const deleteUserMutation = useDeleteUser
