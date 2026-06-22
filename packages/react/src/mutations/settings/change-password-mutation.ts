import {
  type AuthClient,
  type ChangePasswordOptions,
  changePasswordOptions
} from "@better-auth-ui/core"
import { useMutation } from "@tanstack/react-query"

export type { ChangePasswordParams } from "@better-auth-ui/core"

/**
 * Create a mutation for changing the authenticated user's password.
 */
export function useChangePassword<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options?: ChangePasswordOptions<TAuthClient>
) {
  return useMutation({
    ...changePasswordOptions(authClient),
    ...options
  })
}
