import {
  organizationPlugin,
  organizationQueryKeys
} from "@better-auth-ui/core/plugins"
import {
  type DataTag,
  type QueryClient,
  queryOptions,
  skipToken,
  useQuery
} from "@tanstack/react-query"
import type { BetterFetchError } from "better-auth/react"
import { useSession } from "../../hooks/queries/use-session"
import { useAuthPlugin } from "../../hooks/use-auth-plugin"
import type { OrganizationAuthClient } from "../../lib/auth-client"
import type { FullOrganizationParams } from "./full-organization-query"
import type { ListOrganization } from "./list-organizations-query"

// The active-organization cache holds a `ListOrganization`-shaped value even
// though we fetch via `getFullOrganization`. The `members`/`invitations`
// fields are intentionally discarded by the `as Promise<TData>` cast in
// `queryFn` below so that `setActive`'s optimistic update — which can only
// produce a list-shaped org — never corrupts a full-detail cache entry.
// See `organizationQueryKeys.activeOrganization` for the rationale.
export type ActiveOrganizationData<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = ListOrganization<TAuthClient>

export type ActiveOrganizationParams<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = FullOrganizationParams<TAuthClient>

export type ActiveOrganizationOptions<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Omit<
  ReturnType<typeof activeOrganizationOptions<TAuthClient>>,
  "queryKey" | "queryFn"
>

export function activeOrganizationOptions<
  TAuthClient extends OrganizationAuthClient
>(
  authClient: TAuthClient,
  userId: string | undefined,
  params?: ActiveOrganizationParams<TAuthClient>
) {
  type TData = ActiveOrganizationData<TAuthClient>
  const queryKey = organizationQueryKeys.activeOrganization(
    userId,
    params?.query
  )

  const options = queryOptions<TData, BetterFetchError, TData, typeof queryKey>(
    {
      queryKey,
      queryFn: ({ signal }) =>
        authClient.organization.getFullOrganization({
          ...params,
          fetchOptions: { ...params?.fetchOptions, signal, throw: true }
        }) as Promise<TData>
    }
  )

  return options as typeof options & {
    queryKey: DataTag<typeof queryKey, TData, BetterFetchError>
  }
}

export const ensureActiveOrganization = <
  TAuthClient extends OrganizationAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string | undefined,
  params?: ActiveOrganizationParams<TAuthClient>
) =>
  queryClient.ensureQueryData(
    activeOrganizationOptions(authClient, userId, params)
  )

export const prefetchActiveOrganization = <
  TAuthClient extends OrganizationAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string | undefined,
  params?: ActiveOrganizationParams<TAuthClient>
) =>
  queryClient.prefetchQuery(
    activeOrganizationOptions(authClient, userId, params)
  )

export const fetchActiveOrganization = <
  TAuthClient extends OrganizationAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string | undefined,
  params?: ActiveOrganizationParams<TAuthClient>
) =>
  queryClient.fetchQuery(activeOrganizationOptions(authClient, userId, params))

export type UseActiveOrganizationOptions<
  TAuthClient extends OrganizationAuthClient
> = ActiveOrganizationOptions<TAuthClient> &
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
  })

  return useQuery(
    {
      ...queryOptions,
      ...baseOptions,
      queryFn:
        slug === null
          ? async () => null
          : userId
            ? baseOptions.queryFn
            : skipToken
    },
    queryClient
  )
}
