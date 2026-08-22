import {
  type OrganizationAuthClient,
  type OrganizationData,
  type OrganizationParams,
  organizationOptions
} from "@better-auth-ui/core/plugins/organization"
import {
  type QueryClient,
  type UseQueryOptions,
  useQuery
} from "@tanstack/react-query"
import { useSession } from "../../../../hooks/queries/use-session"

/** React Query options for an organization selected by ID or slug. */
export type UseOrganizationOptions<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Omit<
  UseQueryOptions<OrganizationData<TAuthClient>>,
  "queryFn" | "queryKey"
> &
  OrganizationParams<TAuthClient>

/**
 * React query hook for an explicitly selected organization.
 *
 * The query stays disabled until `organizationId` or `organizationSlug` is
 * supplied, so it never relies on active-organization state.
 */
export function useOrganization<TAuthClient extends OrganizationAuthClient>(
  authClient: TAuthClient,
  options: UseOrganizationOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  const { data: session } = useSession(authClient, undefined, queryClient)
  const userId = session?.user.id
  const { query, fetchOptions, ...queryOptions } = options

  return useQuery(
    {
      ...queryOptions,
      ...organizationOptions(authClient, userId, { query, fetchOptions })
    },
    queryClient
  )
}
