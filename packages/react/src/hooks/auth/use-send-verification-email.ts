import {
  type AuthClient,
  useAuth,
  useAuthMutation
} from "@better-auth-ui/react"
import type { UseAuthMutationOptions } from "./use-auth-mutation"

export { useAuthMutation } from "./use-auth-mutation"

/**
 * Hook that creates a mutation to send a verification email.
 *
 * The mutation sends a verification email to the specified email address.
 *
 * @returns The `useMutation` result.
 */
export function useSendVerificationEmail(
  options?: UseAuthMutationOptions<AuthClient["sendVerificationEmail"]>
) {
  const { authClient } = useAuth()
  return useAuthMutation(authClient.sendVerificationEmail, options)
}
