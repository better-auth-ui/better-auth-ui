import {
  type ApiKeyAuthClient,
  type ListApiKeysData,
  type ListApiKeysParams,
  listApiKeysOptions
} from "@better-auth-ui/core/plugins/api-key"
import {
  type QueryClient,
  type UseQueryOptions,
  useQuery
} from "@tanstack/react-query"
import { useSession } from "../../../../hooks/queries/use-session"

export type UseListApiKeysOptions<TAuthClient extends ApiKeyAuthClient> = Omit<
  UseQueryOptions<ListApiKeysData<TAuthClient>>,
  "queryKey"
> &
  ListApiKeysParams<TAuthClient>

/**
 * Subscribe to API keys visible to the current user.
 *
 * @param authClient - The Better Auth client with the API key plugin.
 * @param options - React Query options and API key list params.
 * @param queryClient - Optional React Query client instance.
 */
export function useListApiKeys<TAuthClient extends ApiKeyAuthClient>(
  authClient: TAuthClient,
  options: UseListApiKeysOptions<TAuthClient> = {},
  queryClient?: QueryClient
) {
  const { data: session } = useSession(authClient, undefined, queryClient)
  const userId = session?.user.id
  const { query, fetchOptions, ...queryOptions } = options

  return useQuery(
    {
      ...listApiKeysOptions(authClient, userId, { query, fetchOptions }),
      ...queryOptions
    },
    queryClient
  )
}
