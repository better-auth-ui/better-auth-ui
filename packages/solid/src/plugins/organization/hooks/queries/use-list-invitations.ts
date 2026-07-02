import {
  type ListOrganizationInvitationsData,
  type ListOrganizationInvitationsParams,
  listOrganizationInvitationsOptions,
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
 * Reactive options accessor for `useListOrganizationInvitations`, combining Solid Query options with core query parameters.
 */
export type UseListOrganizationInvitationsOptions<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Accessor<
  Omit<QueryOptions<ListOrganizationInvitationsData<TAuthClient>>, "queryKey"> &
    ListOrganizationInvitationsParams<TAuthClient>
>

/**
 * Solid query hook for organization invitations.
 *
 * @param authClient - The Better Auth client.
 * @param options - Reactive core query parameters and Solid Query options.
 * @param queryClient - Optional Solid Query client accessor override.
 */
export function useListOrganizationInvitations<
  TAuthClient extends OrganizationAuthClient
>(
  authClient: TAuthClient,
  options?: UseListOrganizationInvitationsOptions<TAuthClient>,
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
    const { query, fetchOptions, initialData, ...queryOptions } =
      options?.() ?? {}
    const organizationId = query?.organizationId ?? activeOrganization.data?.id

    return {
      ...listOrganizationInvitationsOptions(authClient, userId, {
        query: { ...query, organizationId },
        fetchOptions
      }),
      ...queryOptions,
      initialData: initialData as undefined
    }
  }, queryClient)
}
