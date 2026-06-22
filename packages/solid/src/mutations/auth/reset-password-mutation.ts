import {
  type AuthClient,
  type ResetPasswordOptions,
  resetPasswordOptions
} from "@better-auth-ui/core"
import { useMutation } from "@tanstack/solid-query"

export type { ResetPasswordParams } from "@better-auth-ui/core"

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
