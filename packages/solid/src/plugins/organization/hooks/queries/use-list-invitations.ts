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

export type UseListOrganizationInvitationsOptions<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Accessor<
  Omit<QueryOptions<ListOrganizationInvitationsData<TAuthClient>>, "queryKey"> &
    ListOrganizationInvitationsParams<TAuthClient>
>

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
    () => ({
      enabled: !options?.().query?.organizationId
    }),
    queryClient
  )

  return useQuery(() => {
    const userId = session.data?.user.id
    const {
      query,
      fetchOptions,
      initialData,
      enabled = true,
      ...queryOptions
    } = options?.() ?? {}
    const organizationId = query?.organizationId ?? activeOrganization.data?.id
    const baseOptions = listOrganizationInvitationsOptions(authClient, userId, {
      query: { ...query, organizationId },
      fetchOptions
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
