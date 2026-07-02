import {
  type HasPermissionData,
  type HasPermissionParams,
  hasPermissionOptions,
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
 * Options for `useHasPermission`, combining React Query options with core query parameters.
 */
export type UseHasPermissionOptions<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Omit<UseQueryOptions<HasPermissionData<TAuthClient>>, "queryKey"> &
  HasPermissionParams<TAuthClient>

/**
 * React query hook for organization permission checks.
 *
 * @param authClient - The Better Auth client.
 * @param options - Core query parameters and React Query options.
 * @param queryClient - Optional React Query client override.
 */
export function useHasPermission<TAuthClient extends OrganizationAuthClient>(
  authClient: TAuthClient,
  options: UseHasPermissionOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  const { data: session } = useSession(authClient, undefined, queryClient)
  const userId = session?.user.id

  const {
    fetchOptions,
    permissions,
    organizationId: optionsOrganizationId,
    ...queryOptions
  } = options

  const { data: activeOrganization } = useActiveOrganization(
    authClient,
    undefined,
    queryClient
  )
  const organizationId = optionsOrganizationId ?? activeOrganization?.id

  return useQuery(
    {
      ...hasPermissionOptions(authClient, userId, {
        fetchOptions,
        organizationId,
        permissions
      }),
      ...queryOptions
    },
    queryClient
  )
}
