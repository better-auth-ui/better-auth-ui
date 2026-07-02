import {
  type ListUserInvitationsData,
  type ListUserInvitationsParams,
  listUserInvitationsOptions,
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
 * Reactive options accessor for `useListUserInvitations`, combining Solid Query options with core query parameters.
 */
export type UseListUserInvitationsOptions<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Accessor<
  Omit<QueryOptions<ListUserInvitationsData<TAuthClient>>, "queryKey"> &
    ListUserInvitationsParams<TAuthClient>
>

/**
 * Solid query hook for the current user's organization invitations.
 *
 * @param authClient - The Better Auth client.
 * @param options - Reactive core query parameters and Solid Query options.
 * @param queryClient - Optional Solid Query client accessor override.
 */
export function useListUserInvitations<
  TAuthClient extends OrganizationAuthClient
>(
  authClient: TAuthClient,
  options?: UseListUserInvitationsOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  const session = useSession(authClient, undefined, queryClient)

  return useQuery(() => {
    const userId = session.data?.user.id
    const { query, fetchOptions, initialData, ...queryOptions } =
      options?.() ?? {}

    return {
      ...listUserInvitationsOptions(authClient, userId, {
        query,
        fetchOptions
      }),
      ...queryOptions,
      initialData: initialData as undefined
    }
  }, queryClient)
}
