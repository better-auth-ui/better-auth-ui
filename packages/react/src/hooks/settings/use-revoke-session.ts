import {
  type AuthClient,
  useAuth,
  useAuthMutation
} from "@better-auth-ui/react"
import type { UseAuthMutationOptions } from "../auth/use-auth-mutation"

import { useListSessions } from "./use-list-sessions"

/**
 * Hook that creates a mutation for revoking a user session.
 *
 * @returns The `useMutation` result.
 */
export function useRevokeSession(
  options?: UseAuthMutationOptions<AuthClient["revokeSession"]>
) {
  const { authClient } = useAuth()
  const { refetch } = useListSessions()

  return useAuthMutation(authClient.revokeSession, {
    ...options,
    onSuccess: async (...args) => {
      await refetch()
      await options?.onSuccess?.(...args)
    }
  })
}
