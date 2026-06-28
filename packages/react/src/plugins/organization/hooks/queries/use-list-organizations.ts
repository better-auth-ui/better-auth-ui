import {
  type ListOrganizationsData,
  type ListOrganizationsParams,
  listOrganizationsOptions,
  type OrganizationAuthClient
} from "@better-auth-ui/core/plugins/organization"
import {
  type QueryClient,
  skipToken,
  type UseQueryOptions,
  useQuery
} from "@tanstack/react-query"
import { useSession } from "../../../../hooks/queries/use-session"

export type UseListOrganizationsOptions<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Omit<UseQueryOptions<ListOrganizationsData<TAuthClient>>, "queryKey"> &
  ListOrganizationsParams<TAuthClient>

export function useListOrganizations<
  TAuthClient extends OrganizationAuthClient
>(
  authClient: TAuthClient,
  options: UseListOrganizationsOptions<TAuthClient> = {},
  queryClient?: QueryClient
) {
  const { data: session } = useSession(authClient, undefined, queryClient)
  const userId = session?.user.id

  const { query, fetchOptions, ...queryOptions } = options
  const baseOptions = listOrganizationsOptions(authClient, userId, {
    query,
    fetchOptions
  })

  return useQuery(
    {
      ...baseOptions,

      queryFn: userId ? baseOptions.queryFn : skipToken,

      ...queryOptions
    },
    queryClient
  )
}
