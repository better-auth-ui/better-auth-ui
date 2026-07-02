import {
  type ActiveOrganizationData,
  type ActiveOrganizationParams,
  activeOrganizationOptions,
  type OrganizationAuthClient,
  organizationPlugin,
  resolveActiveOrganizationQuery
} from "@better-auth-ui/core/plugins/organization"
import {
  type QueryClient,
  type UseQueryOptions,
  useQuery
} from "@tanstack/react-query"
import { useSession } from "../../../../hooks/queries/use-session"
import { useAuthPlugin } from "../../../../hooks/use-auth-plugin"

/**
 * Options for `useActiveOrganization`, combining React Query options with core query parameters.
 */
export type UseActiveOrganizationOptions<
  TAuthClient extends OrganizationAuthClient
> = Omit<UseQueryOptions<ActiveOrganizationData<TAuthClient>>, "queryKey"> &
  ActiveOrganizationParams<TAuthClient>

/**
 * React query hook for the active organization.
 *
 * @param authClient - The Better Auth client.
 * @param options - Core query parameters and React Query options.
 * @param queryClient - Optional React Query client override.
 */
export function useActiveOrganization<
  TAuthClient extends OrganizationAuthClient
>(
  authClient: TAuthClient,
  options: UseActiveOrganizationOptions<TAuthClient> = {},
  queryClient?: QueryClient
) {
  const { data: session } = useSession(authClient, undefined, queryClient)
  const userId = session?.user.id
  const { slug } = useAuthPlugin(organizationPlugin)
  const { query, fetchOptions, ...queryOptions } = options

  return useQuery(
    {
      ...activeOrganizationOptions(authClient, userId, {
        fetchOptions,
        query: resolveActiveOrganizationQuery(query, slug)
      } as ActiveOrganizationParams<TAuthClient>),
      ...queryOptions
    },
    queryClient
  )
}
