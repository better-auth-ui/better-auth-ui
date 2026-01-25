import { useAuth, useAuthMutation } from "@better-auth-ui/react"
import type { UseMutationOptions } from "@tanstack/react-query"
import type { BetterFetchError } from "better-auth/react"

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
  options?: UseMutationOptions<
    { status: boolean },
    BetterFetchError,
    { email: string }
  >
) {
  const { authClient } = useAuth()
  return useAuthMutation(authClient.requestPasswordReset, options)
}
