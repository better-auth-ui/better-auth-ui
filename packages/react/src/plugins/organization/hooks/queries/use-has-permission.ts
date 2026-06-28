import {
  type HasPermissionData,
  type HasPermissionParams,
  hasPermissionOptions,
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

export type UseHasPermissionOptions<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Omit<UseQueryOptions<HasPermissionData<TAuthClient>>, "queryKey"> &
  HasPermissionParams<TAuthClient>

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
    { enabled: !optionsOrganizationId },
    queryClient
  )

  const organizationId = optionsOrganizationId ?? activeOrganization?.id
  const baseOptions = hasPermissionOptions(authClient, userId, {
    fetchOptions,
    organizationId,
    permissions
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
