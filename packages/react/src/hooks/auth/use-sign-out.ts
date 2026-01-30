import {
  type AuthClient,
  useAuth,
  useAuthMutation
} from "@better-auth-ui/react"
import { useQueryClient } from "@tanstack/react-query"
import type { UseAuthMutationOptions } from "./use-auth-mutation"

export { useAuthMutation } from "./use-auth-mutation"

/**
 * Hook that creates a mutation for signing out.
 *
 * The mutation signs out the current user and removes auth queries from cache.
 *
 * @returns The `useMutation` result.
 */
export function useSignOut(
  options?: UseAuthMutationOptions<AuthClient["signOut"]>
) {
  const { authClient } = useAuth()
  const queryClient = useQueryClient()

  return useAuthMutation({
    authFn: authClient.signOut,
    options: {
      ...options,
      onSuccess: async (...args) => {
        queryClient.removeQueries({ queryKey: ["auth"] })
        await options?.onSuccess?.(...args)
      }
    }
  })
}
