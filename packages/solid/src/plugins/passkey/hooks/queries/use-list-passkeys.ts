import {
  type ListPasskeysData,
  type ListPasskeysParams,
  listPasskeysOptions,
  type PasskeyAuthClient
} from "@better-auth-ui/core/plugins/passkey"
import {
  type QueryClient,
  type QueryOptions,
  useQuery
} from "@tanstack/solid-query"
import type { Accessor } from "solid-js"
import { useSession } from "../../../../hooks/queries/use-session"

export type UseListPasskeysOptions<TAuthClient extends PasskeyAuthClient> =
  Accessor<
    Omit<QueryOptions<ListPasskeysData<TAuthClient>>, "queryKey"> &
      ListPasskeysParams<TAuthClient>
  >

export function useListPasskeys<TAuthClient extends PasskeyAuthClient>(
  authClient: TAuthClient,
  options?: UseListPasskeysOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  const sessionQuery = useSession(authClient, undefined, queryClient)

  return useQuery(() => {
    const userId = sessionQuery.data?.user.id
    const {
      query,
      fetchOptions,
      initialData,
      enabled = true,
      ...queryOptions
    } = options?.() ?? {}
    const baseOptions = listPasskeysOptions(authClient, userId, {
      query,
      fetchOptions
    })

    return {
      ...baseOptions,
      queryFn: baseOptions.queryFn,
      ...queryOptions,
      enabled: Boolean(userId) && enabled,
      initialData: initialData as undefined
    }
  }, queryClient)
}
