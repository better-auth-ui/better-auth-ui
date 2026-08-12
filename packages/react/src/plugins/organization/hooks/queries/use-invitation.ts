import {
  type InvitationData,
  type InvitationOptions,
  invitationOptions,
  type OrganizationAuthClient
} from "@better-auth-ui/core/plugins/organization"
import {
  type QueryClient,
  skipToken,
  type UseQueryOptions,
  useQuery
} from "@tanstack/react-query"
import { useSession } from "../../../../hooks/queries/use-session"

export type UseInvitationOptions<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Omit<UseQueryOptions<InvitationData<TAuthClient>>, "queryKey"> &
  InvitationOptions<TAuthClient>

export function useInvitation<TAuthClient extends OrganizationAuthClient>(
  authClient: TAuthClient,
  options: UseInvitationOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  const { data: session } = useSession(authClient, undefined, queryClient)
  const userId = session?.user.id
  const { query, fetchOptions, ...queryOptions } = options
  const baseOptions = invitationOptions(authClient, userId, {
    query,
    fetchOptions
  })

  return useQuery(
    {
      ...baseOptions,
      ...queryOptions,
      queryFn: userId && query.id ? baseOptions.queryFn : skipToken
    },
    queryClient
  )
}
