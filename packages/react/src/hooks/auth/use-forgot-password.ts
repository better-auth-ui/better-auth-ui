import {
  type AuthClient,
  useAuth,
  useAuthMutation
} from "@better-auth-ui/react"
import type { UseAuthMutationOptions } from "./use-auth-mutation"

export { useAuthMutation } from "./use-auth-mutation"

/**
 * Hook that creates a mutation for the forgot-password flow.
 *
 * The mutation sends a password reset request for the submitted email,
 * and navigates to the sign-in view on success.
 *
 * @returns The `useMutation` result.
 */
export function useForgotPassword(
  options?: UseAuthMutationOptions<AuthClient["requestPasswordReset"]>
) {
  const { authClient } = useAuth()
  return useAuthMutation(authClient.requestPasswordReset, options)
}
