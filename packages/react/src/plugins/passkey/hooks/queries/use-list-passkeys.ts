import {
  type ListPasskeysData,
  type ListPasskeysParams,
  listPasskeysOptions,
  type PasskeyAuthClient
} from "@better-auth-ui/core/plugins/passkey"
import {
  type QueryClient,
  skipToken,
  type UseQueryOptions,
  useQuery
} from "@tanstack/react-query"
import { useSession } from "../../../../hooks/queries/use-session"

export type UseListPasskeysOptions<TAuthClient extends PasskeyAuthClient> =
  Omit<UseQueryOptions<ListPasskeysData<TAuthClient>>, "queryKey"> &
    ListPasskeysParams<TAuthClient>

export function useListPasskeys<TAuthClient extends PasskeyAuthClient>(
  authClient: TAuthClient,
  options: UseListPasskeysOptions<TAuthClient> = {},
  queryClient?: QueryClient
) {
  const { data: session } = useSession(authClient, undefined, queryClient)
  const userId = session?.user.id

  const { query, fetchOptions, ...queryOptions } = options
  const baseOptions = listPasskeysOptions(authClient, userId, {
    query,
    fetchOptions
  })

  return useQuery(
    {
      ...baseOptions,
      queryFn: userId ? baseOptions.queryFn : skipToken,
      ...queryOptions
    },
    queryClient
  )
}
