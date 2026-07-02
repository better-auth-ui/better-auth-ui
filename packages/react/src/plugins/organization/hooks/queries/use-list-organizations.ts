import {
  type ListOrganizationsData,
  type ListOrganizationsParams,
  listOrganizationsOptions,
  type OrganizationAuthClient
} from "@better-auth-ui/core/plugins/organization"
import {
  type QueryClient,
  type UseQueryOptions,
  useQuery
} from "@tanstack/react-query"
import { useSession } from "../../../../hooks/queries/use-session"

/**
 * Options for `useListOrganizations`, combining React Query options with core query parameters.
 */
export type UseListOrganizationsOptions<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Omit<UseQueryOptions<ListOrganizationsData<TAuthClient>>, "queryKey"> &
  ListOrganizationsParams<TAuthClient>

/**
 * React query hook for the current user's organizations.
 *
 * @param authClient - The Better Auth client.
 * @param options - Core query parameters and React Query options.
 * @param queryClient - Optional React Query client override.
 */
export function useListOrganizations<
  TAuthClient extends OrganizationAuthClient
>(
  authClient: TAuthClient,
  options: UseListOrganizationsOptions<TAuthClient> = {},
  queryClient?: QueryClient
) {
  const { data: session } = useSession(authClient, undefined, queryClient)
  const userId = session?.user.id
  const { query, fetchOptions, ...queryOptions } = options

  return useQuery(
    {
      ...listOrganizationsOptions(authClient, userId, { query, fetchOptions }),
      ...queryOptions
    },
    queryClient
  )
}
