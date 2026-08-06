import {
  type AuthClient,
  type ListSessionsData,
  type ListSessionsParams,
  listSessionsOptions
} from "@better-auth-ui/core"
import {
  type QueryClient,
  type QueryOptions,
  useQuery
} from "@tanstack/solid-query"
import type { Accessor } from "solid-js"

import { useSession } from "./use-session"

export type UseListSessionsOptions<TAuthClient extends AuthClient> = Accessor<
  Omit<QueryOptions<ListSessionsData<TAuthClient>>, "queryKey"> &
    ListSessionsParams<TAuthClient>
>

export function useListSessions<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options?: UseListSessionsOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
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
      initialData: initialData as undefined
    }
  }, queryClient)
}
