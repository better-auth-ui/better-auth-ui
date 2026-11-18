import {
  type QueryClient,
  type QueryOptions,
  skipToken
} from "@tanstack/query-core"
import type { InferData } from "../../lib/auth-client"
import { createAuthQueryFetchOptions } from "../../lib/auth-query-retry"
import type { OrganizationAuthClient } from "./organization-auth-client"
import { organizationQueryKeys } from "./organization-query-keys"
import { authRequestData } from "../../lib/auth-request-data"

export type HasPermissionData<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = InferData<TAuthClient["organization"]["hasPermission"]>

export type HasPermissionParams<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Parameters<TAuthClient["organization"]["hasPermission"]>[0]

export type HasPermissionOptions<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Omit<QueryOptions<HasPermissionData<TAuthClient>>, "queryKey"> &
  HasPermissionParams<TAuthClient>

/**
 * Query options factory for checking organization permissions.
 *
 * Unlike most organization queries, `hasPermission` uses flat params rather than
 * a nested `query` object. Missing user or organization IDs disable the query.
 *
 * @param authClient - The Better Auth organization client.
 * @param userId - The current signed-in user's ID. Used for cache partitioning.
 * @param params - Parameters forwarded to `authClient.organization.hasPermission`.
 */
export function hasPermissionOptions<
  TAuthClient extends OrganizationAuthClient
>(
  authClient: TAuthClient,
  userId: string | undefined,
  params: HasPermissionParams<TAuthClient>
) {
  type TData = HasPermissionData<TAuthClient>
  // `hasPermission` is the only org client method without a `query` field — its
  // params are flat — so the cache-key query portion is everything except
  // `fetchOptions`.
  const { fetchOptions, ...query } = params
  const queryKey = organizationQueryKeys.permissions.has(userId, query)

  return {
    queryKey,
    queryFn:
      userId && params.organizationId
        ? ({ signal }) =>
            authRequestData<TData>(
              authClient.organization.hasPermission({
                ...query,
                fetchOptions: createAuthQueryFetchOptions(fetchOptions, signal)
              })
            )
        : skipToken
  } satisfies QueryOptions
}

/**
 * Get organization permission data from cache, fetching if needed.
 */
export const ensureHasPermission = <TAuthClient extends OrganizationAuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string,
  options?: HasPermissionOptions<TAuthClient>
) => {
  const { fetchOptions, permissions, organizationId, ...queryOptions } =
    options ?? {}

  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- rebuilds the generic params from their own fields
  const params = {
    fetchOptions,
    organizationId,
    permissions
  } as HasPermissionParams<TAuthClient>

  return queryClient.ensureQueryData({
    ...hasPermissionOptions(authClient, userId, params),
    ...queryOptions
  })
}

/**
 * Prefetch organization permission data into the query cache.
 */
export const prefetchHasPermission = <
  TAuthClient extends OrganizationAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string,
  options?: HasPermissionOptions<TAuthClient>
) => {
  const { fetchOptions, permissions, organizationId, ...queryOptions } =
    options ?? {}

  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- rebuilds the generic params from their own fields
  const params = {
    fetchOptions,
    organizationId,
    permissions
  } as HasPermissionParams<TAuthClient>

  return queryClient.prefetchQuery({
    ...hasPermissionOptions(authClient, userId, params),
    ...queryOptions
  })
}

/**
 * Fetch and cache organization permission data, resolving with data or throwing.
 */
export const fetchHasPermission = <TAuthClient extends OrganizationAuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string,
  options?: HasPermissionOptions<TAuthClient>
) => {
  const { fetchOptions, permissions, organizationId, ...queryOptions } =
    options ?? {}

  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- rebuilds the generic params from their own fields
  const params = {
    fetchOptions,
    organizationId,
    permissions
  } as HasPermissionParams<TAuthClient>

  return queryClient.fetchQuery({
    ...hasPermissionOptions(authClient, userId, params),
    ...queryOptions
  })
}
/**
 * Read organization permission data synchronously from the query cache.
 */
export const getHasPermission = <
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
>(
  queryClient: QueryClient,
  _authClient?: TAuthClient,
  userId?: string,
  params?: HasPermissionParams<TAuthClient>
) => {
  const { fetchOptions: _fetchOptions, ...query } = params ?? {}
  const queryKey = organizationQueryKeys.permissions.has(userId, query)
  return queryClient.getQueryData<HasPermissionData<TAuthClient>>(queryKey)
}
