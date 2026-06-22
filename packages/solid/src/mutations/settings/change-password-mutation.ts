import {
  type AuthClient,
  type ChangePasswordOptions,
  changePasswordOptions
} from "@better-auth-ui/core"
import { useMutation } from "@tanstack/solid-query"

export type { ChangePasswordParams } from "@better-auth-ui/core"

export function useChangePassword<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options?: ChangePasswordOptions<TAuthClient>
) {
  return useMutation(() => ({
    ...changePasswordOptions(authClient),
    ...options
  }))
}
export const changePasswordMutation = useChangePassword
