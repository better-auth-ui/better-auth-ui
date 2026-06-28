import {
  type ListOrganizationsData,
  type ListOrganizationsParams,
  listOrganizationsOptions,
  type OrganizationAuthClient
} from "@better-auth-ui/core/plugins/organization"
import {
  type QueryClient,
  type QueryOptions,
  useQuery
} from "@tanstack/solid-query"
import type { Accessor } from "solid-js"
import { useSession } from "../../../../hooks/queries/use-session"

export type UseListOrganizationsOptions<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Accessor<
  Omit<QueryOptions<ListOrganizationsData<TAuthClient>>, "queryKey"> &
    ListOrganizationsParams<TAuthClient>
>

export function useListOrganizations<
  TAuthClient extends OrganizationAuthClient
>(
  authClient: TAuthClient,
  options?: UseListOrganizationsOptions<TAuthClient>,
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
    const baseOptions = listOrganizationsOptions(authClient, userId, {
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
