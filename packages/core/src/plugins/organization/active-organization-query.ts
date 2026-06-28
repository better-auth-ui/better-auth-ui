import {
  type QueryClient,
  type QueryOptions,
  skipToken
} from "@tanstack/query-core"
import type { FullOrganizationParams } from "./full-organization-query"
import type { ListOrganization } from "./list-organizations-query"
import type { OrganizationAuthClient } from "./organization-auth-client"
import { organizationQueryKeys } from "./organization-query-keys"

// The active-organization cache holds a `ListOrganization`-shaped value even
// though we fetch via `getFullOrganization`. The `members`/`invitations`
// fields are intentionally discarded by the `as Promise<TData>` cast in
// `queryFn` below so that `setActive`'s optimistic update — which can only
// produce a list-shaped org — never corrupts a full-detail cache entry.
export type ActiveOrganizationData<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = ListOrganization<TAuthClient> | null

export type ActiveOrganizationParams<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = FullOrganizationParams<TAuthClient>

export type ActiveOrganizationOptions<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Omit<QueryOptions<ActiveOrganizationData<TAuthClient>>, "queryKey"> &
  ActiveOrganizationParams<TAuthClient>

export function activeOrganizationOptions<
  TAuthClient extends OrganizationAuthClient
>(
  authClient: TAuthClient,
  userId?: string,
  params?: ActiveOrganizationParams<TAuthClient>
) {
  type TData = ActiveOrganizationData<TAuthClient>
  const queryKey = organizationQueryKeys.activeOrganization(
    userId,
    params?.query
  )

  return {
    queryKey,
    queryFn: userId
      ? ({ signal }) =>
          authClient.organization.getFullOrganization({
            ...params,
            fetchOptions: { ...params?.fetchOptions, signal, throw: true }
          }) as Promise<TData>
      : skipToken
  } satisfies QueryOptions
}

export const ensureActiveOrganization = <
  TAuthClient extends OrganizationAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId?: string,
  options?: ActiveOrganizationOptions<TAuthClient>
) => {
  const { fetchOptions, query, ...queryOptions } = options ?? {}

  return queryClient.ensureQueryData({
    ...activeOrganizationOptions(authClient, userId, { query, fetchOptions }),
    ...queryOptions
  })
}

export const prefetchActiveOrganization = <
  TAuthClient extends OrganizationAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId?: string,
  options?: ActiveOrganizationOptions<TAuthClient>
) => {
  const { fetchOptions, query, ...queryOptions } = options ?? {}

  return queryClient.prefetchQuery({
    ...activeOrganizationOptions(authClient, userId, { query, fetchOptions }),
    ...queryOptions
  })
}

export const fetchActiveOrganization = <
  TAuthClient extends OrganizationAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId?: string,
  options?: ActiveOrganizationOptions<TAuthClient>
) => {
  const { fetchOptions, query, ...queryOptions } = options ?? {}

  return queryClient.fetchQuery({
    ...activeOrganizationOptions(authClient, userId, { query, fetchOptions }),
    ...queryOptions
  })
}
export const getActiveOrganization = <
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
>(
  queryClient: QueryClient,
  _authClient?: TAuthClient,
  userId?: string,
  params?: ActiveOrganizationParams<TAuthClient>
) => {
  const queryKey = organizationQueryKeys.activeOrganization(
    userId,
    params?.query
  )
  return queryClient.getQueryData<ActiveOrganizationData<TAuthClient>>(queryKey)
}
