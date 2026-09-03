import {
  type AuthClient,
  type UnlinkAccountOptions,
  unlinkAccountOptions
} from "@better-auth-ui/core"
import { type QueryClient, useMutation } from "@tanstack/react-query"
import { useSession } from "../queries/use-session"

/**
 * Create a mutation for unlinking a social provider from the current user.
 */
export function useUnlinkAccount<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options?: UnlinkAccountOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  const { data: session } = useSession(authClient, undefined, queryClient)
  const userId = session?.user.id
  const mutationOptions = unlinkAccountOptions(authClient, userId)

  return useMutation(
    {
      ...mutationOptions,
      ...options,
      meta: { ...mutationOptions.meta, ...options?.meta }
    },
    queryClient
  )
}
