import {
  type ListOAuthConsentsData,
  type ListOAuthConsentsParams,
  listOAuthConsentsOptions,
  type OAuthProviderAuthClient
} from "@better-auth-ui/core/plugins/oauth-provider"
import {
  type QueryClient,
  type QueryOptions,
  useQuery
} from "@tanstack/solid-query"
import type { Accessor } from "solid-js"
import { useSession } from "../../../../hooks/queries/use-session"

export type UseListOAuthConsentsOptions<
  TAuthClient extends OAuthProviderAuthClient
> = Accessor<
  Omit<QueryOptions<ListOAuthConsentsData<TAuthClient>>, "queryKey"> &
    ListOAuthConsentsParams<TAuthClient>
>

/**
 * Subscribe to the OAuth applications the signed-in user has authorized.
 */
export function useListOAuthConsents<
  TAuthClient extends OAuthProviderAuthClient
>(
  authClient: TAuthClient,
  options?: UseListOAuthConsentsOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  const session = useSession(authClient, undefined, queryClient)

  return useQuery(() => {
    const { fetchOptions, initialData, ...queryOptions } = options?.() ?? {}

    return {
      ...listOAuthConsentsOptions(authClient, session.data?.user.id, {
        fetchOptions
      } as ListOAuthConsentsParams<TAuthClient>),
      ...queryOptions,
      initialData: initialData as undefined
    }
  }, queryClient)
}
