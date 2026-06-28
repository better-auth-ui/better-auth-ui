import {
  type ListOrganizationMembersData,
  type ListOrganizationMembersParams,
  listOrganizationMembersOptions,
  type OrganizationAuthClient
} from "@better-auth-ui/core/plugins/organization"
import {
  type QueryClient,
  skipToken,
  type UseQueryOptions,
  useQuery
} from "@tanstack/react-query"
import { useSession } from "../../../../hooks/queries/use-session"
import { useActiveOrganization } from "./use-active-organization"

export type UseListOrganizationMembersOptions<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Omit<
  UseQueryOptions<ListOrganizationMembersData<TAuthClient>>,
  "queryKey"
> &
  ListOrganizationMembersParams<TAuthClient>

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
    { enabled: !query?.organizationId },
    queryClient
  )
  const organizationId = query?.organizationId ?? activeOrganization?.id
  const baseOptions = listOrganizationMembersOptions(authClient, userId, {
    query: { ...query, organizationId },
    fetchOptions
  })

  return useQuery(
    {
      ...baseOptions,

      queryFn: userId && organizationId ? baseOptions.queryFn : skipToken,

      ...queryOptions
    },
    queryClient
  )
}
