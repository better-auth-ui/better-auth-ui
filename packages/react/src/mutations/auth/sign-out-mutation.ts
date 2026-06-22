import {
  type AuthClient,
  authQueryKeys,
  type SignOutOptions,
  signOutOptions
} from "@better-auth-ui/core"
import {
  type QueryClient,
  useMutation,
  useQueryClient
} from "@tanstack/react-query"

export type { SignOutParams } from "@better-auth-ui/core"

/**
 * Create a mutation for signing the current user out.
 */
export function useSignOut<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options?: SignOutOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  const defaultQueryClient = useQueryClient(queryClient)

  return useMutation(
    {
      ...signOutOptions(authClient),
      ...options,
      onSuccess: async (...args) => {
        defaultQueryClient.removeQueries({ queryKey: authQueryKeys.all })
        await options?.onSuccess?.(...args)
      }
    },
    queryClient
  )
}
