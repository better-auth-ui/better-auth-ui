import {
  type AuthClient,
  useAuth,
  useAuthMutation
} from "@better-auth-ui/react"
import type { UseAuthMutationOptions } from "../auth/use-auth-mutation"

export { useAuthMutation } from "../auth/use-auth-mutation"

/**
 * Hook that creates a mutation for changing the authenticated user's password.
 *
 * @returns The `useMutation` result.
 */
export function useChangePassword(
  options?: UseAuthMutationOptions<AuthClient["changePassword"]>
) {
  const { authClient } = useAuth()
  return useAuthMutation({ authFn: authClient.changePassword, options })
}
