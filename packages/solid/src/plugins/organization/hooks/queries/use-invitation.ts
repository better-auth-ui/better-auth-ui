import {
  type InvitationData,
  type InvitationOptions,
  invitationOptions,
  type OrganizationAuthClient
} from "@better-auth-ui/core/plugins/organization"
import {
  type QueryClient,
  type QueryOptions,
  skipToken,
  useQuery,
  type UseQueryResult
} from "@tanstack/solid-query"
import type { Accessor } from "solid-js"
import { useSession } from "../../../../hooks/queries/use-session"
import { passInitialData } from "../../../../lib/query-initial-data"
import type { InferData } from "@better-auth-ui/core"

export type UseInvitationOptions<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Accessor<
  Omit<QueryOptions<InvitationData<TAuthClient>>, "queryKey"> &
    InvitationOptions<TAuthClient>
>

export function useInvitation<TAuthClient extends OrganizationAuthClient>(
  authClient: TAuthClient,
  options: UseInvitationOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
): UseQueryResult<InferData<TAuthClient["organization"]["getInvitation"]>> {
  const session = useSession(authClient, undefined, queryClient)

  return useQuery(() => {
    const userId = session.data?.user.id
    const { query, fetchOptions, initialData, ...queryOptions } = options()
    const baseOptions = invitationOptions(authClient, userId, {
      query,
      fetchOptions
    })

    return {
      ...baseOptions,
      ...queryOptions,
      ...passInitialData(initialData),
      queryFn: userId && query.id ? baseOptions.queryFn : skipToken
    }
  }, queryClient)
}
