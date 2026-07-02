import {
  type QueryClient,
  type QueryOptions,
  skipToken
} from "@tanstack/query-core"
import type { InferData } from "../../lib/auth-client"
import type { OrganizationAuthClient } from "./organization-auth-client"
import { organizationQueryKeys } from "./organization-query-keys"

/**
 * Data returned by the Better Auth full organization endpoint.
 */
export type FullOrganizationData<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = InferData<TAuthClient["organization"]["getFullOrganization"]>

/**
 * Parameters accepted by the Better Auth full organization endpoint.
 */
export type FullOrganizationParams<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Parameters<TAuthClient["organization"]["getFullOrganization"]>[0]

/**
 * Query options for fetching a full organization, excluding the generated query key.
 */
export type FullOrganizationOptions<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Omit<QueryOptions<FullOrganizationData<TAuthClient>>, "queryKey"> &
  FullOrganizationParams<TAuthClient>

/**
 * Query options factory for fetching a full organization.
 *
 * @param authClient - The Better Auth client with the organization plugin.
 * @param userId - The current signed-in user's ID. Used for cache partitioning.
 * @param params - Parameters forwarded to `getFullOrganization`.
 */
export function fullOrganizationOptions<
  TAuthClient extends OrganizationAuthClient
>(
  authClient: TAuthClient,
  userId?: string,
  params?: FullOrganizationParams<TAuthClient>
) {
  type TData = FullOrganizationData<TAuthClient>
  const queryKey = organizationQueryKeys.fullDetail(userId, params?.query)

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

/**
 * Get a full organization from cache, fetching it if needed.
 */
export const ensureFullOrganization = <
  TAuthClient extends OrganizationAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId?: string,
  options?: FullOrganizationOptions<TAuthClient>
) => {
  const { fetchOptions, query, ...queryOptions } = options ?? {}

  return queryClient.ensureQueryData({
    ...fullOrganizationOptions(authClient, userId, { query, fetchOptions }),
    ...queryOptions
  })
}

/**
 * Prefetch a full organization into the query cache.
 */
export const prefetchFullOrganization = <
  TAuthClient extends OrganizationAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId?: string,
  options?: FullOrganizationOptions<TAuthClient>
) => {
  const { fetchOptions, query, ...queryOptions } = options ?? {}

  return queryClient.prefetchQuery({
    ...fullOrganizationOptions(authClient, userId, { query, fetchOptions }),
    ...queryOptions
  })
}

/**
 * Fetch and cache a full organization, resolving with data or throwing.
 */
export const fetchFullOrganization = <
  TAuthClient extends OrganizationAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId?: string,
  options?: FullOrganizationOptions<TAuthClient>
) => {
  const { fetchOptions, query, ...queryOptions } = options ?? {}

  return queryClient.fetchQuery({
    ...fullOrganizationOptions(authClient, userId, { query, fetchOptions }),
    ...queryOptions
  })
}
