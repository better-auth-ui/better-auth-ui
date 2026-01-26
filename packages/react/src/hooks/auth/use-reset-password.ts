import {
  type AuthClient,
  useAuth,
  useAuthMutation
} from "@better-auth-ui/react"
import type { UseAuthMutationOptions } from "./use-auth-mutation"

export { useAuthMutation } from "./use-auth-mutation"

/**
 * Hook that creates a mutation for the reset-password flow.
 *
 * The mutation resets the user's password using the provided token and new password.
 *
 * @returns The `useMutation` result.
 */
export function useResetPassword(
  options?: UseAuthMutationOptions<AuthClient["resetPassword"]>
) {
  const { authClient } = useAuth()
  return useAuthMutation(authClient.resetPassword, options)
}
