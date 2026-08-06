import {
  type ListUserInvitationsData,
  type ListUserInvitationsParams,
  listUserInvitationsOptions,
  type OrganizationAuthClient
} from "@better-auth-ui/core/plugins/organization"
import {
  type QueryClient,
  type UseQueryOptions,
  useQuery
} from "@tanstack/react-query"
import { useSession } from "../../../../hooks/queries/use-session"

/**
 * Options for `useListUserInvitations`, combining React Query options with core query parameters.
 */
export type UseListUserInvitationsOptions<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Omit<UseQueryOptions<ListUserInvitationsData<TAuthClient>>, "queryKey"> &
  ListUserInvitationsParams<TAuthClient>

/**
 * React query hook for the current user's organization invitations.
 *
 * @param authClient - The Better Auth client.
 * @param options - Core query parameters and React Query options.
 * @param queryClient - Optional React Query client override.
 */
export function useListUserInvitations<
  TAuthClient extends OrganizationAuthClient
>(
  authClient: TAuthClient,
  options: UseListUserInvitationsOptions<TAuthClient> = {},
  queryClient?: QueryClient
) {
  const { data: session } = useSession(authClient, undefined, queryClient)
  const userId = session?.user.id
  const { query, fetchOptions, ...queryOptions } = options

  return useQuery(
    {
      ...listUserInvitationsOptions(authClient, userId, {
        query,
        fetchOptions
      }),
      ...queryOptions
    },
    queryClient
  )
}
