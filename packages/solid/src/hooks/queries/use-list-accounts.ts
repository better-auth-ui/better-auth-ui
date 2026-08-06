import {
  type AuthClient,
  type ListAccountsData,
  type ListAccountsParams,
  listAccountsOptions
} from "@better-auth-ui/core"
import {
  type QueryClient,
  type QueryOptions,
  useQuery
} from "@tanstack/solid-query"
import type { Accessor } from "solid-js"
import { useSession } from "./use-session"

export type UseListAccountsOptions<TAuthClient extends AuthClient> = Accessor<
  Omit<QueryOptions<ListAccountsData<TAuthClient>>, "queryKey"> &
    ListAccountsParams<TAuthClient>
>

export function useListAccounts<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options?: UseListAccountsOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  const session = useSession(authClient, undefined, queryClient)
  const userId = () => session.data?.user.id

  return useQuery(() => {
    const { query, fetchOptions, initialData, ...queryOptions } =
      options?.() ?? {}

    return {
      ...listAccountsOptions(authClient, userId(), {
        query,
        fetchOptions
      }),
      ...queryOptions,
      initialData: initialData as undefined
    }
  }, queryClient)
}
