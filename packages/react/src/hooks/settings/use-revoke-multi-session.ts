import {
  type AuthClient,
  useAuth,
  useAuthMutation,
  useListDeviceSessions
} from "@better-auth-ui/react"
import type { UseAuthMutationOptions } from "../auth/use-auth-mutation"

/**
 * Hook that creates a mutation for revoking a device session in multi-session mode.
 *
 * @returns The `useMutation` result.
 */
export function useRevokeMultiSession(
  options?: UseAuthMutationOptions<AuthClient["multiSession"]["revoke"]>
) {
  const { authClient } = useAuth()
  const { refetch } = useListDeviceSessions()

  return useAuthMutation({
    authFn: authClient.multiSession.revoke,
    options: {
      ...options,
      onSuccess: async (...args) => {
        await refetch()
        await options?.onSuccess?.(...args)
      }
    }
  })
}
