import {
  type FullOrganizationData,
  type FullOrganizationParams,
  fullOrganizationOptions,
  type OrganizationAuthClient
} from "@better-auth-ui/core/plugins/organization"
import {
  type QueryClient,
  skipToken,
  type UseQueryOptions,
  useQuery
} from "@tanstack/react-query"
import { useSession } from "../../../../hooks/queries/use-session"

export type UseFullOrganizationOptions<
  TAuthClient extends OrganizationAuthClient
> = Omit<UseQueryOptions<FullOrganizationData<TAuthClient>>, "queryKey"> &
  FullOrganizationParams<TAuthClient>

export function useFullOrganization<TAuthClient extends OrganizationAuthClient>(
  authClient: TAuthClient,
  options: UseFullOrganizationOptions<TAuthClient> = {},
  queryClient?: QueryClient
) {
  const { data: session } = useSession(authClient, undefined, queryClient)
  const userId = session?.user.id
  const { query, fetchOptions, ...queryOptions } = options
  const baseOptions = fullOrganizationOptions(authClient, userId, {
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
