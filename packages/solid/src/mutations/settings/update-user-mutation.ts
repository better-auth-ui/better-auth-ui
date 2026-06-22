import {
  type AuthClient,
  type UpdateUserOptions,
  updateUserOptions
} from "@better-auth-ui/core"
import { useMutation } from "@tanstack/solid-query"

export type { UpdateUserParams } from "@better-auth-ui/core"

export function useUpdateUser<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options?: UpdateUserOptions<TAuthClient>
) {
  return useMutation(() => ({
    ...updateUserOptions(authClient),
    ...options
  }))
}
export const updateUserMutation = useUpdateUser
