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

/**
 * Reactive options accessor for `useListPasskeys`, combining Solid Query options with core query parameters.
 */
export type UseListPasskeysOptions<TAuthClient extends PasskeyAuthClient> =
  Accessor<
    Omit<QueryOptions<ListPasskeysData<TAuthClient>>, "queryKey"> &
      ListPasskeysParams<TAuthClient>
  >

/**
 * Solid query hook for passkeys for the current user.
 *
 * @param authClient - The Better Auth client.
 * @param options - Reactive core query parameters and Solid Query options.
 * @param queryClient - Optional Solid Query client accessor override.
 */
export function useListPasskeys<TAuthClient extends PasskeyAuthClient>(
  authClient: TAuthClient,
  options?: UseListPasskeysOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  const sessionQuery = useSession(authClient, undefined, queryClient)

  return useQuery(() => {
    const userId = sessionQuery.data?.user.id
    const { query, fetchOptions, initialData, ...queryOptions } =
      options?.() ?? {}

    return {
      ...listPasskeysOptions(authClient, userId, { query, fetchOptions }),
      ...queryOptions,
      initialData: initialData as undefined
    }
  }, queryClient)
}
