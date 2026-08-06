import {
  type ActiveOrganizationData,
  type ActiveOrganizationParams,
  activeOrganizationOptions,
  type OrganizationAuthClient,
  resolveActiveOrganizationQuery
} from "@better-auth-ui/core/plugins/organization"
import {
  type QueryClient,
  type QueryOptions,
  useQuery
} from "@tanstack/solid-query"
import type { Accessor } from "solid-js"
import { useSession } from "../../../../hooks/queries/use-session"
import { useOrganizationSlug } from "../../queries/plugin"

/**
 * Reactive options accessor for `useActiveOrganization`, combining Solid Query options with core query parameters.
 */
export type UseActiveOrganizationOptions<
  TAuthClient extends OrganizationAuthClient
> = Accessor<
  Omit<QueryOptions<ActiveOrganizationData<TAuthClient>>, "queryKey"> &
    ActiveOrganizationParams<TAuthClient>
>

/**
 * Solid query hook for the active organization.
 *
 * @param authClient - The Better Auth client.
 * @param options - Reactive core query parameters and Solid Query options.
 * @param queryClient - Optional Solid Query client accessor override.
 */
export function useActiveOrganization<
  TAuthClient extends OrganizationAuthClient
>(
  authClient: TAuthClient,
  options?: UseActiveOrganizationOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  const session = useSession(authClient, undefined, queryClient)
  const slug = useOrganizationSlug()

  return useQuery(() => {
    const userId = session.data?.user.id
    const { query, fetchOptions, initialData, ...queryOptions } =
      options?.() ?? {}

    return {
      ...activeOrganizationOptions(authClient, userId, {
        query: resolveActiveOrganizationQuery(query, slug),
        fetchOptions
      } as ActiveOrganizationParams<TAuthClient>),
      ...queryOptions,
      initialData: initialData as undefined
    }
  }, queryClient)
}
