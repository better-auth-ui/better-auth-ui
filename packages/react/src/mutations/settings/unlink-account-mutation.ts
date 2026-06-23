import {
  type AuthClient,
  type UnlinkAccountOptions,
  unlinkAccountOptions
} from "@better-auth-ui/core"
import { type QueryClient, useMutation } from "@tanstack/react-query"
import { useSession } from "../../hooks/queries/use-session"

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
      ...unlinkAccountOptions(authClient, userId),
      ...options
    },
    queryClient
  )
}
