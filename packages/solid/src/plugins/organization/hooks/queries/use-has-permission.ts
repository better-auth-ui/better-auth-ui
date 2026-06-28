import {
  type HasPermissionData,
  type HasPermissionParams,
  hasPermissionOptions,
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

export type UseHasPermissionOptions<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Accessor<
  Omit<QueryOptions<HasPermissionData<TAuthClient>>, "queryKey"> &
    HasPermissionParams<TAuthClient>
>

export function useHasPermission<TAuthClient extends OrganizationAuthClient>(
  authClient: TAuthClient,
  options: UseHasPermissionOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  const session = useSession(authClient, undefined, queryClient)
  const activeOrganization = useActiveOrganization(
    authClient,
    () => ({
      enabled: !options().organizationId
    }),
    queryClient
  )

  return useQuery(() => {
    const userId = session.data?.user.id
    const {
      fetchOptions,
      initialData,
      enabled = true,
      permissions,
      organizationId: optionsOrganizationId,
      ...queryOptions
    } = options?.() ?? {}
    const organizationId = optionsOrganizationId ?? activeOrganization.data?.id
    const baseOptions = hasPermissionOptions(authClient, userId, {
      fetchOptions,
      organizationId,
      permissions
    })

    return {
      ...baseOptions,
      queryFn: baseOptions.queryFn,
      ...queryOptions,
      enabled: Boolean(userId) && Boolean(organizationId) && enabled,
      initialData: initialData as undefined
    }
  }, queryClient)
}
