import {
  type AuthClient,
  useAuth,
  useAuthMutation
} from "@better-auth-ui/react"
import type { UseAuthMutationOptions } from "./use-auth-mutation"

export { useAuthMutation } from "./use-auth-mutation"

/**
 * Hook that creates a mutation for social sign-in.
 *
 * The mutation initiates a social sign-in flow with the specified provider.
 *
 * @returns The `useMutation` result.
 */
export function useSignInSocial(
  options?: UseAuthMutationOptions<AuthClient["signIn"]["social"]>
) {
  const { authClient } = useAuth()
  return useAuthMutation(authClient.signIn.social, options)
}
