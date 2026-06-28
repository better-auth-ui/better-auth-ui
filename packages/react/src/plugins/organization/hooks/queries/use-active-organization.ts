import {
  type ActiveOrganizationData,
  type ActiveOrganizationParams,
  activeOrganizationOptions,
  type OrganizationAuthClient,
  organizationPlugin
} from "@better-auth-ui/core/plugins/organization"
import {
  type QueryClient,
  skipToken,
  type UseQueryOptions,
  useQuery
} from "@tanstack/react-query"
import { useSession } from "../../../../hooks/queries/use-session"
import { useAuthPlugin } from "../../../../hooks/use-auth-plugin"

export type UseActiveOrganizationOptions<
  TAuthClient extends OrganizationAuthClient
> = Omit<UseQueryOptions<ActiveOrganizationData<TAuthClient>>, "queryKey"> &
  ActiveOrganizationParams<TAuthClient>

export function useActiveOrganization<
  TAuthClient extends OrganizationAuthClient
>(
  authClient: TAuthClient,
  options: UseActiveOrganizationOptions<TAuthClient> = {},
  queryClient?: QueryClient
) {
  const { data: session } = useSession(authClient, undefined, queryClient)
  const userId = session?.user.id
  const { slug } = useAuthPlugin(organizationPlugin)
  const { query, fetchOptions, ...queryOptions } = options

  const baseOptions = activeOrganizationOptions(authClient, userId, {
    fetchOptions,
    query: slug ? { organizationSlug: slug } : query
  } as ActiveOrganizationParams<TAuthClient>)

  return useQuery(
    {
      ...baseOptions,

      queryFn:
        slug === null
          ? async () => null
          : userId
            ? baseOptions.queryFn
            : skipToken,

      ...queryOptions
    },
    queryClient
  )
}
