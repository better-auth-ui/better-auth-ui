import {
  type AuthClient,
  type RequestPasswordResetOptions,
  requestPasswordResetOptions
} from "@better-auth-ui/core"
import { useMutation } from "@tanstack/react-query"

/**
 * Create a mutation for requesting a password reset email.
 */
export function useRequestPasswordReset<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options?: RequestPasswordResetOptions<TAuthClient>
) {
  return useMutation({
    ...requestPasswordResetOptions(authClient),
    ...options
  })
}
