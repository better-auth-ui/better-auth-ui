import {
  type OrganizationAuthClient,
  type OrganizationData,
  type OrganizationParams,
  organizationOptions
} from "@better-auth-ui/core/plugins/organization"
import {
  type QueryClient,
  type QueryOptions,
  useQuery
} from "@tanstack/solid-query"
import type { Accessor } from "solid-js"
import { useSession } from "../../../../hooks/queries/use-session"

/** Reactive Solid Query options for an organization selected by ID or slug. */
export type UseOrganizationOptions<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Accessor<
  Omit<QueryOptions<OrganizationData<TAuthClient>>, "queryFn" | "queryKey"> &
    OrganizationParams<TAuthClient>
>

/**
 * Solid query hook for an explicitly selected organization.
 *
 * The query stays disabled until `organizationId` or `organizationSlug` is
 * supplied, so it never relies on active-organization state.
 */
export function useOrganization<TAuthClient extends OrganizationAuthClient>(
  authClient: TAuthClient,
  options: UseOrganizationOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  const session = useSession(authClient, undefined, queryClient)

  return useQuery(() => {
    const userId = session.data?.user.id
    const { query, fetchOptions, initialData, ...queryOptions } = options()

    return {
      ...queryOptions,
      ...organizationOptions(authClient, userId, { query, fetchOptions }),
      initialData: initialData as undefined
    }
  }, queryClient)
}
