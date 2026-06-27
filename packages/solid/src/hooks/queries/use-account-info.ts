import {
  type AccountInfoData,
  type AccountInfoParams,
  type AuthClient,
  accountInfoOptions
} from "@better-auth-ui/core"
import {
  type QueryClient,
  type QueryOptions,
  useQuery
} from "@tanstack/solid-query"
import type { Accessor } from "solid-js"
import { useSession } from "./use-session"

export type UseAccountInfoOptions<TAuthClient extends AuthClient> = Accessor<
  Omit<QueryOptions<AccountInfoData<TAuthClient>>, "queryKey"> &
    AccountInfoParams<TAuthClient>
>

export function useAccountInfo<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options?: UseAccountInfoOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  const session = useSession(authClient, undefined, queryClient)
  const userId = () => session.data?.user.id

  return useQuery(() => {
    const { query, fetchOptions, initialData, ...queryOptions } =
      options?.() ?? {}

    return {
      ...accountInfoOptions(authClient, userId(), {
        query,
        fetchOptions
      }),
      ...queryOptions,
      initialData: initialData as undefined
    }
  }, queryClient)
}
