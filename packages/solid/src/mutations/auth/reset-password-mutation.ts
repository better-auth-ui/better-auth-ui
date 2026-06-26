import {
  type AuthClient,
  type ResetPasswordOptions,
  resetPasswordOptions
} from "@better-auth-ui/core"
import { useMutation } from "@tanstack/solid-query"

export function useResetPassword<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options?: ResetPasswordOptions<TAuthClient>
) {
  return useMutation(() => ({
    ...resetPasswordOptions(authClient),
    ...options
  }))
}
export const resetPasswordMutation = useResetPassword
