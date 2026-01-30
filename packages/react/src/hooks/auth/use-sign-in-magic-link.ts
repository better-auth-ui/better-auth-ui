import {
  type AuthClient,
  useAuth,
  useAuthMutation
} from "@better-auth-ui/react"
import type { UseAuthMutationOptions } from "./use-auth-mutation"

export { useAuthMutation } from "./use-auth-mutation"

/**
 * Hook that creates a mutation for magic-link sign-in.
 *
 * The mutation sends a magic-link sign-in email to the specified address.
 *
 * @returns The `useMutation` result.
 */
export function useSignInMagicLink(
  options?: UseAuthMutationOptions<AuthClient["signIn"]["magicLink"]>
) {
  const { authClient } = useAuth()
  return useAuthMutation({ authFn: authClient.signIn.magicLink, options })
}
