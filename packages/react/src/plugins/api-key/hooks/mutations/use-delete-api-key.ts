import {
  type ApiKeyAuthClient,
  type DeleteApiKeyOptions,
  deleteApiKeyOptions
} from "@better-auth-ui/core/plugins/api-key"
import { type QueryClient, useMutation } from "@tanstack/react-query"
import { useSession } from "../../../../hooks/queries/use-session"

/**
 * Create a mutation for deleting an API key.
 *
 * On success, `MutationInvalidator` awaits invalidation of the user's API key
 * list queries (see `meta.awaits`).
 *
 * @param authClient - The Better Auth client with the API key plugin.
 * @param options - React Query options forwarded to `useMutation`.
 */
export function useDeleteApiKey<TAuthClient extends ApiKeyAuthClient>(
  authClient: TAuthClient,
  options?: DeleteApiKeyOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  const { data: session } = useSession(authClient, undefined, queryClient)
  const userId = session?.user.id

  return useMutation(
    {
      ...deleteApiKeyOptions(authClient, userId),
      ...options
    },
    queryClient
  )
}
