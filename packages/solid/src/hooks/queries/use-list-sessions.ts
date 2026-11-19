import {
  type AuthClient,
  type InferData,
  type ListSessionsData,
  type ListSessionsParams,
  listSessionsOptions
} from "@better-auth-ui/core"
import {
  type QueryClient,
  type QueryOptions,
  useQuery,
  type UseQueryResult
} from "@tanstack/solid-query"
import type { Accessor } from "solid-js"

import { useSession } from "./use-session"
import { passInitialData } from "../../lib/query-initial-data"

export type UseListSessionsOptions<TAuthClient extends AuthClient> = Accessor<
  Omit<QueryOptions<ListSessionsData<TAuthClient>>, "queryKey"> &
    ListSessionsParams<TAuthClient>
>

export function useListSessions<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options?: UseListSessionsOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
): UseQueryResult<InferData<TAuthClient["listSessions"]>> {
  const session = useSession(authClient, undefined, queryClient)
  const userId = () => session.data?.user.id

  return useQuery(() => {
    const { query, fetchOptions, initialData, ...queryOptions } =
      options?.() ?? {}

    return {
      ...listSessionsOptions(authClient, userId(), {
        query,
        fetchOptions
      }),
      ...queryOptions,
      ...passInitialData(initialData)
    }
  }, queryClient)
}
