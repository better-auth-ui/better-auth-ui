import {
  type AuthClient,
  authQueryKeys,
  type UnlinkAccountOptions,
  unlinkAccountOptions
} from "@better-auth-ui/core"
import { type QueryClient, useMutation } from "@tanstack/react-query"
import { useSession } from "../../hooks/queries/use-session"

export type { UnlinkAccountParams } from "@better-auth-ui/core"

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

  return useMutation(
    {
      ...unlinkAccountOptions(authClient),
      ...options,
      meta: {
        awaits: [authQueryKeys.listAccounts(userId)]
      }
    },
    queryClient
  )
}
