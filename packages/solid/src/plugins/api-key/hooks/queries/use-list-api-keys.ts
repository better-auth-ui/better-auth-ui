import {
  type ApiKeyAuthClient,
  type ListApiKeysData,
  type ListApiKeysParams,
  listApiKeysOptions
} from "@better-auth-ui/core/plugins/api-key"
import {
  type QueryClient,
  type QueryOptions,
  useQuery
} from "@tanstack/solid-query"
import type { Accessor } from "solid-js"
import { useSession } from "../../../../hooks/queries/use-session"

/**
 * Reactive options accessor for `useListApiKeys`, combining Solid Query options with core query parameters.
 */
export type UseListApiKeysOptions<TAuthClient extends ApiKeyAuthClient> =
  Accessor<
    Omit<QueryOptions<ListApiKeysData<TAuthClient>>, "queryKey"> &
      ListApiKeysParams<TAuthClient>
  >

/**
 * Solid query hook for API keys for the current user or organization.
 *
 * @param authClient - The Better Auth client.
 * @param options - Reactive core query parameters and Solid Query options.
 * @param queryClient - Optional Solid Query client accessor override.
 */
export function useListApiKeys<TAuthClient extends ApiKeyAuthClient>(
  authClient: TAuthClient,
  options?: UseListApiKeysOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  const session = useSession(authClient, undefined, queryClient)

  return useQuery(() => {
    const userId = session.data?.user.id
    const { query, fetchOptions, initialData, ...queryOptions } =
      options?.() ?? {}

    return {
      ...listApiKeysOptions(authClient, userId, { query, fetchOptions }),
      ...queryOptions,
      initialData: initialData as undefined
    }
  }, queryClient)
}
