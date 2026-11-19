import {
  type ApiKeyAuthClient,
  type GetApiKeyData,
  type GetApiKeyParams,
  getApiKeyOptions
} from "@better-auth-ui/core/plugins/api-key"
import {
  type QueryClient,
  type UseQueryOptions,
  type UseQueryResult,
  useQuery
} from "@tanstack/react-query"
import { useSession } from "../../../../hooks/queries/use-session"
import type { InferData } from "@better-auth-ui/core"

/** React Query options and client parameters for `useGetApiKey`. */
export type UseGetApiKeyOptions<TAuthClient extends ApiKeyAuthClient> = Omit<
  UseQueryOptions<GetApiKeyData<TAuthClient>>,
  "queryKey"
> &
  GetApiKeyParams<TAuthClient>

/** Subscribe to one API key visible to the current user. */
export function useGetApiKey<TAuthClient extends ApiKeyAuthClient>(
  authClient: TAuthClient,
  options: UseGetApiKeyOptions<TAuthClient>,
  queryClient?: QueryClient
): UseQueryResult<NoInfer<InferData<TAuthClient["apiKey"]["get"]>>> {
  const { data: session } = useSession(authClient, undefined, queryClient)
  const { query, fetchOptions, ...queryOptions } = options

  return useQuery(
    {
      ...getApiKeyOptions(authClient, session?.user.id, {
        query,
        fetchOptions
      }),
      ...queryOptions
    },
    queryClient
  )
}
