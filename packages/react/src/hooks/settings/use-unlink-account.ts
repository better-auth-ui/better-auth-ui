import {
  type AuthClient,
  useAuth,
  useAuthMutation
} from "@better-auth-ui/react"
import type { UseAuthMutationOptions } from "../auth/use-auth-mutation"

import { useListAccounts } from "./use-list-accounts"

/**
 * Hook that creates a mutation for unlinking a social provider from the current user.
 *
 * @returns The `useMutation` result.
 */
export function useUnlinkAccount(
  options?: UseAuthMutationOptions<AuthClient["unlinkAccount"]>
) {
  const { authClient } = useAuth()
  const { refetch } = useListAccounts()

  return useAuthMutation({
    authFn: authClient.unlinkAccount,
    options: {
      ...options,
      onSuccess: async (...args) => {
        await refetch()
        await options?.onSuccess?.(...args)
      }
    }
  })
}
