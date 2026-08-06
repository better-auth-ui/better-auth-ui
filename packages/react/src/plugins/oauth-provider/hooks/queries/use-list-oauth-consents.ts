import {
  type ListOAuthConsentsData,
  type ListOAuthConsentsParams,
  listOAuthConsentsOptions,
  type OAuthProviderAuthClient
} from "@better-auth-ui/core/plugins/oauth-provider"
import {
  type QueryClient,
  type UseQueryOptions,
  useQuery
} from "@tanstack/react-query"
import { useSession } from "../../../../hooks/queries/use-session"

export type UseListOAuthConsentsOptions<
  TAuthClient extends OAuthProviderAuthClient
> = Omit<UseQueryOptions<ListOAuthConsentsData<TAuthClient>>, "queryKey"> &
  ListOAuthConsentsParams<TAuthClient>

/**
 * Subscribe to the OAuth applications the signed-in user has authorized.
 */
export function useListOAuthConsents<
  TAuthClient extends OAuthProviderAuthClient
>(
  authClient: TAuthClient,
  options: UseListOAuthConsentsOptions<TAuthClient> = {},
  queryClient?: QueryClient
) {
  const { data: session } = useSession(authClient, undefined, queryClient)
  const { fetchOptions, ...queryOptions } = options

  return useQuery(
    {
      ...listOAuthConsentsOptions(authClient, session?.user.id, {
        fetchOptions
      } as ListOAuthConsentsParams<TAuthClient>),
      ...queryOptions
    },
    queryClient
  )
}
