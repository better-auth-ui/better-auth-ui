import { authMutationKeys, authQueryKeys } from "@better-auth-ui/core"
import { useMutation, useQueryClient } from "@tanstack/solid-query"
import type { AuthClient } from "../../lib/auth-client"

export function useSignOut<TAuthClient extends AuthClient>(
  authClient: TAuthClient
) {
  const queryClient = useQueryClient()

  return useMutation(() => ({
    mutationKey: authMutationKeys.signOut,
    mutationFn: async () => {
      await authClient.signOut({
        fetchOptions: { throw: true }
      })
    },
    onSuccess: () => {
      queryClient.removeQueries({
        queryKey: authQueryKeys.all
      })
    }
  }))
}
