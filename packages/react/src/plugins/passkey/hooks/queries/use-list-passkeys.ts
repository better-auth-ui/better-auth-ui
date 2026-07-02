import {
  type ListPasskeysData,
  type ListPasskeysParams,
  listPasskeysOptions,
  type PasskeyAuthClient
} from "@better-auth-ui/core/plugins/passkey"
import {
  type QueryClient,
  type UseQueryOptions,
  useQuery
} from "@tanstack/react-query"
import { useSession } from "../../../../hooks/queries/use-session"

/**
 * Options for `useListPasskeys`, combining React Query options with core query parameters.
 */
export type UseListPasskeysOptions<TAuthClient extends PasskeyAuthClient> =
  Omit<UseQueryOptions<ListPasskeysData<TAuthClient>>, "queryKey"> &
    ListPasskeysParams<TAuthClient>

/**
 * React query hook for passkeys for the current user.
 *
 * @param authClient - The Better Auth client.
 * @param options - Core query parameters and React Query options.
 * @param queryClient - Optional React Query client override.
 */
export function useListPasskeys<TAuthClient extends PasskeyAuthClient>(
  authClient: TAuthClient,
  options: UseListPasskeysOptions<TAuthClient> = {},
  queryClient?: QueryClient
) {
  const { data: session } = useSession(authClient, undefined, queryClient)
  const userId = session?.user.id
  const { query, fetchOptions, ...queryOptions } = options

  return useQuery(
    {
      ...listPasskeysOptions(authClient, userId, { query, fetchOptions }),
      ...queryOptions
    },
    queryClient
  )
}
