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

/**
 * Reactive options accessor for `useHasPermission`, combining Solid Query options with core query parameters.
 */
export type UseHasPermissionOptions<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Accessor<
  Omit<QueryOptions<HasPermissionData<TAuthClient>>, "queryKey"> &
    HasPermissionParams<TAuthClient>
>

/**
 * Solid query hook for organization permission checks.
 *
 * @param authClient - The Better Auth client.
 * @param options - Reactive core query parameters and Solid Query options.
 * @param queryClient - Optional Solid Query client accessor override.
 */
export function useHasPermission<TAuthClient extends OrganizationAuthClient>(
  authClient: TAuthClient,
  options: UseHasPermissionOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  const session = useSession(authClient, undefined, queryClient)
  const activeOrganization = useActiveOrganization(
    authClient,
    undefined,
    queryClient
  )

  return useQuery(() => {
    const userId = session.data?.user.id
    const {
      fetchOptions,
      initialData,
      permissions,
      organizationId: optionsOrganizationId,
      ...queryOptions
    } = options()
    const organizationId = optionsOrganizationId ?? activeOrganization.data?.id

    return {
      ...hasPermissionOptions(authClient, userId, {
        fetchOptions,
        organizationId,
        permissions
      }),
      ...queryOptions,
      initialData: initialData as undefined
    }
  }, queryClient)
}
