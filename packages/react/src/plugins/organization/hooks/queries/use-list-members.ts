import {
  type ListOrganizationMembersData,
  type ListOrganizationMembersParams,
  listOrganizationMembersOptions,
  type OrganizationAuthClient
} from "@better-auth-ui/core/plugins/organization"
import {
  type QueryClient,
  type UseQueryOptions,
  useQuery
} from "@tanstack/react-query"
import { useSession } from "../../../../hooks/queries/use-session"
import { useActiveOrganization } from "./use-active-organization"

/**
 * Options for `useListOrganizationMembers`, combining React Query options with core query parameters.
 */
export type UseListOrganizationMembersOptions<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Omit<
  UseQueryOptions<ListOrganizationMembersData<TAuthClient>>,
  "queryKey"
> &
  ListOrganizationMembersParams<TAuthClient>

/**
 * React query hook for organization members.
 *
 * @param authClient - The Better Auth client.
 * @param options - Core query parameters and React Query options.
 * @param queryClient - Optional React Query client override.
 */
export function useListOrganizationMembers<
  TAuthClient extends OrganizationAuthClient
>(
  authClient: TAuthClient,
  options: UseListOrganizationMembersOptions<TAuthClient> = {},
  queryClient?: QueryClient
) {
  const { data: session } = useSession(authClient, undefined, queryClient)
  const userId = session?.user.id

  const { query, fetchOptions, ...queryOptions } = options

  const { data: activeOrganization } = useActiveOrganization(
    authClient,
    undefined,
    queryClient
  )

  return useQuery(
    {
      ...listOrganizationMembersOptions(authClient, userId, {
        query: {
          ...query,
          organizationId: query?.organizationId ?? activeOrganization?.id
        },
        fetchOptions
      }),
      ...queryOptions
    },
    queryClient
  )
}
