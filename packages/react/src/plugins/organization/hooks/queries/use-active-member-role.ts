import {
  type ActiveMemberRoleData,
  type ActiveMemberRoleParams,
  activeMemberRoleOptions,
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
 * Options for `useActiveMemberRole`, combining React Query options with core
 * query parameters.
 */
export type UseActiveMemberRoleOptions<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Omit<UseQueryOptions<ActiveMemberRoleData<TAuthClient>>, "queryKey"> &
  ActiveMemberRoleParams<TAuthClient>

/**
 * React query hook for the signed-in user's own role in an organization.
 *
 * Prefer this over scanning `useListOrganizationMembers` for the current user:
 * with a paginated member list the signed-in user may not be on the loaded
 * page.
 *
 * @param authClient - The Better Auth client.
 * @param options - Core query parameters and React Query options.
 * @param queryClient - Optional React Query client override.
 */
export function useActiveMemberRole<TAuthClient extends OrganizationAuthClient>(
  authClient: TAuthClient,
  options: UseActiveMemberRoleOptions<TAuthClient> = {},
  queryClient?: QueryClient
) {
  const { data: session } = useSession(authClient, undefined, queryClient)
  const userId = session?.user.id

  const { query, fetchOptions, ...queryOptions } = options

  const hasExplicitOrganization = Boolean(
    query?.organizationId || query?.organizationSlug
  )

  const { data: activeOrganization } = useActiveOrganization(
    authClient,
    { enabled: !hasExplicitOrganization },
    queryClient
  )

  return useQuery(
    {
      ...activeMemberRoleOptions(authClient, userId, {
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
