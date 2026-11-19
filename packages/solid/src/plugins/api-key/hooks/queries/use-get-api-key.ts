import {
  type ApiKeyAuthClient,
  type GetApiKeyData,
  type GetApiKeyParams,
  getApiKeyOptions
} from "@better-auth-ui/core/plugins/api-key"
import {
  type QueryClient,
  type QueryOptions,
  useQuery,
  type UseQueryResult
} from "@tanstack/solid-query"
import type { Accessor } from "solid-js"
import { useSession } from "../../../../hooks/queries/use-session"
import { passInitialData } from "../../../../lib/query-initial-data"
import type { InferData } from "@better-auth-ui/core"

/** Reactive Solid Query options and client parameters for `useGetApiKey`. */
export type UseGetApiKeyOptions<TAuthClient extends ApiKeyAuthClient> =
  Accessor<
    Omit<QueryOptions<GetApiKeyData<TAuthClient>>, "queryKey"> &
      GetApiKeyParams<TAuthClient>
  >

/** Subscribe to one API key visible to the current user. */
export function useGetApiKey<TAuthClient extends ApiKeyAuthClient>(
  authClient: TAuthClient,
  options: UseGetApiKeyOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
): UseQueryResult<InferData<TAuthClient["apiKey"]["get"]>> {
  const session = useSession(authClient, undefined, queryClient)

  return useQuery(() => {
    const { query, fetchOptions, initialData, ...queryOptions } = options()

    return {
      ...getApiKeyOptions(authClient, session.data?.user.id, {
        query,
        fetchOptions
      }),
      ...queryOptions,
      ...passInitialData(initialData)
    }
  }, queryClient)
}
