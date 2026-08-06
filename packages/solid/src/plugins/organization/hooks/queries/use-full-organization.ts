import {
  type FullOrganizationData,
  type FullOrganizationParams,
  fullOrganizationOptions,
  type OrganizationAuthClient
} from "@better-auth-ui/core/plugins/organization"
import {
  type QueryClient,
  type QueryOptions,
  useQuery
} from "@tanstack/solid-query"
import type { Accessor } from "solid-js"
import { useSession } from "../../../../hooks/queries/use-session"

/**
 * Reactive options accessor for `useFullOrganization`, combining Solid Query options with core query parameters.
 */
export type UseFullOrganizationOptions<
  TAuthClient extends OrganizationAuthClient
> = Accessor<
  Omit<QueryOptions<FullOrganizationData<TAuthClient>>, "queryKey"> &
    FullOrganizationParams<TAuthClient>
>

/**
 * Solid query hook for a full organization by query parameters.
 *
 * @param authClient - The Better Auth client.
 * @param options - Reactive core query parameters and Solid Query options.
 * @param queryClient - Optional Solid Query client accessor override.
 */
export function useFullOrganization<TAuthClient extends OrganizationAuthClient>(
  authClient: TAuthClient,
  options?: UseFullOrganizationOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  const session = useSession(authClient, undefined, queryClient)

  return useQuery(() => {
    const userId = session.data?.user.id
    const { query, fetchOptions, initialData, ...queryOptions } =
      options?.() ?? {}

    return {
      ...fullOrganizationOptions(authClient, userId, { query, fetchOptions }),
      ...queryOptions,
      initialData: initialData as undefined
    }
  }, queryClient)
}
