import {
  type ActiveMemberRoleData,
  type ActiveMemberRoleParams,
  activeMemberRoleOptions,
  type OrganizationAuthClient
} from "@better-auth-ui/core/plugins/organization"
import {
  type QueryClient,
  type QueryOptions,
  useQuery
} from "@tanstack/solid-query"
import type { Accessor } from "solid-js"
import { useSession } from "../../../../hooks/queries/use-session"
import { useActiveOrganization } from "./use-active-organization"

/**
 * Reactive options accessor for `useActiveMemberRole`, combining Solid Query
 * options with core query parameters.
 */
export type UseActiveMemberRoleOptions<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Accessor<
  Omit<QueryOptions<ActiveMemberRoleData<TAuthClient>>, "queryKey"> &
    ActiveMemberRoleParams<TAuthClient>
>

/**
 * Solid query hook for the signed-in user's own role in an organization.
 *
 * Prefer this over scanning `useListOrganizationMembers` for the current user:
 * with a paginated member list the signed-in user may not be on the loaded
 * page.
 *
 * @param authClient - The Better Auth client.
 * @param options - Reactive core query parameters and Solid Query options.
 * @param queryClient - Optional Solid Query client accessor override.
 */
export function useActiveMemberRole<TAuthClient extends OrganizationAuthClient>(
  authClient: TAuthClient,
  options?: UseActiveMemberRoleOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  const session = useSession(authClient, undefined, queryClient)
  const hasExplicitOrganization = () => {
    const query = options?.().query
    return Boolean(query?.organizationId || query?.organizationSlug)
  }
  const activeOrganization = useActiveOrganization(
    authClient,
    () => ({ enabled: !hasExplicitOrganization() }),
    queryClient
  )

  return useQuery(() => {
    const userId = session.data?.user.id
    const { query, fetchOptions, initialData, ...queryOptions } =
      options?.() ?? {}
    const organizationId = query?.organizationId ?? activeOrganization.data?.id

    return {
      ...activeMemberRoleOptions(authClient, userId, {
        query: { ...query, organizationId },
        fetchOptions
      }),
      ...queryOptions,
      initialData: initialData as undefined
    }
  }, queryClient)
}
