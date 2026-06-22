import {
  type AuthClient,
  type ResetPasswordOptions,
  resetPasswordOptions
} from "@better-auth-ui/core"
import { useMutation } from "@tanstack/react-query"

export type { ResetPasswordParams } from "@better-auth-ui/core"

/**
 * Create a mutation for completing a password reset.
 */
export function useResetPassword<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options?: ResetPasswordOptions<TAuthClient>
) {
  return useMutation({
    ...resetPasswordOptions(authClient),
    ...options
  })
}
