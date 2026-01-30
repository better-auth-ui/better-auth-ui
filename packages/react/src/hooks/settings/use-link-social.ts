import {
  type AuthClient,
  useAuth,
  useAuthMutation
} from "@better-auth-ui/react"
import type { UseAuthMutationOptions } from "../auth/use-auth-mutation"

/**
 * Hook that creates a mutation for linking a social provider to the current user.
 *
 * @returns The `useMutation` result.
 */
export function useLinkSocial(
  options?: UseAuthMutationOptions<AuthClient["linkSocial"]>
) {
  const { authClient } = useAuth()
  return useAuthMutation({ authFn: authClient.linkSocial, options })
}
