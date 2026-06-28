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

export type UseListUserInvitationsOptions<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Accessor<
  Omit<QueryOptions<ListUserInvitationsData<TAuthClient>>, "queryKey"> &
    ListUserInvitationsParams<TAuthClient>
>

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
    const {
      query,
      fetchOptions,
      initialData,
      enabled = true,
      ...queryOptions
    } = options?.() ?? {}
    const baseOptions = listUserInvitationsOptions(authClient, userId, {
      query,
      fetchOptions
    })

    return {
      ...baseOptions,
      queryFn: baseOptions.queryFn,
      ...queryOptions,
      enabled: Boolean(userId) && enabled,
      initialData: initialData as undefined
    }
  }, queryClient)
}
