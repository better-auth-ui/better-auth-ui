import {
  type QueryClient,
  type QueryOptions,
  skipToken
} from "@tanstack/query-core"
import { createAuthQueryFetchOptions } from "../../lib/auth-query-retry"
import type { FullOrganizationParams } from "./full-organization-query"
import type { ListOrganization } from "./list-organizations-query"
import type { OrganizationAuthClient } from "./organization-auth-client"
import { organizationQueryKeys } from "./organization-query-keys"

// The active-organization cache exposes a `ListOrganization`-shaped value even
// though `getFullOrganization` can return more fields. Consumers must use the
// full-detail query for members and invitations because the `setActive`
// optimistic update can only provide a list-shaped organization.
/**
 * Cached data returned by active organization queries.
 */
export type ActiveOrganizationData<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = ListOrganization<TAuthClient> | null

/**
 * Parameters forwarded to the active organization query factory.
 */
export type ActiveOrganizationParams<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = FullOrganizationParams<TAuthClient>

/**
 * Consumer options for active organization query helpers and hooks.
 */
export type ActiveOrganizationOptions<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Omit<QueryOptions<ActiveOrganizationData<TAuthClient>>, "queryKey"> &
  ActiveOrganizationParams<TAuthClient>

type ActiveOrganizationQuery<TAuthClient extends OrganizationAuthClient> =
  NonNullable<ActiveOrganizationParams<TAuthClient>> extends {
    query?: infer TQuery
  }
    ? TQuery
    : never

/**
 * Resolve the active organization query from explicit options and plugin state.
 *
 * An explicit caller-provided organization ID or slug takes precedence over
 * plugin state. Otherwise, a plugin slug selects the route organization and a
 * `null` plugin slug selects no organization. An undefined plugin slug lets
 * Better Auth use the active organization stored on the session.
 *
 * @param query - Caller-provided organization query options.
 * @param organizationSlug - Organization slug from framework plugin state.
 */
export function resolveActiveOrganizationQuery<
  TAuthClient extends OrganizationAuthClient
>(
  query: ActiveOrganizationQuery<TAuthClient> | undefined,
  organizationSlug?: string | null
) {
  const explicitQuery = query as
    | { organizationId?: string; organizationSlug?: string | null }
    | undefined
  const queryOptions = (query ?? {}) as Record<string, unknown>

  if (explicitQuery?.organizationId || explicitQuery?.organizationSlug) {
    return query
  }

  if (organizationSlug !== undefined) {
    return {
      ...queryOptions,
      organizationSlug
    } as ActiveOrganizationQuery<TAuthClient>
  }

  return query
}

/**
 * Query options factory for the current user's active organization.
 *
 * `organizationSlug: null` returns `null` without a network request, while a
 * missing user ID disables the query with `skipToken`.
 *
 * @param authClient - The Better Auth organization client.
 * @param userId - The current signed-in user's ID. Used for cache partitioning.
 * @param params - Parameters forwarded to `getFullOrganization`.
 */
export function activeOrganizationOptions<
  TAuthClient extends OrganizationAuthClient
>(
  authClient: TAuthClient,
  userId?: string,
  params?: ActiveOrganizationParams<TAuthClient>
) {
  type TData = ActiveOrganizationData<TAuthClient>
  const query = params?.query as
    | { organizationSlug?: string | null }
    | undefined
  const hasNoActiveOrganization = query?.organizationSlug === null
  const queryKey = organizationQueryKeys.activeOrganization(
    userId,
    params?.query
  )

  const queryFn = (() => {
    if (hasNoActiveOrganization) return async () => null
    if (!userId) return skipToken

    return ({ signal }: { signal: AbortSignal }) =>
      authClient.organization.getFullOrganization({
        ...params,
        fetchOptions: createAuthQueryFetchOptions(params?.fetchOptions, signal)
      } as ActiveOrganizationParams<TAuthClient>) as unknown as Promise<TData>
  })()

  return {
    queryKey,
    queryFn
  } satisfies QueryOptions
}

/**
 * Get the active organization from cache, fetching if needed.
 */
export const ensureActiveOrganization = <
  TAuthClient extends OrganizationAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string,
  options?: ActiveOrganizationOptions<TAuthClient>
) => {
  const { fetchOptions, query, ...queryOptions } = options ?? {}

  return queryClient.ensureQueryData({
    ...activeOrganizationOptions(authClient, userId, { query, fetchOptions }),
    ...queryOptions
  })
}

/**
 * Prefetch the active organization into the query cache.
 */
export const prefetchActiveOrganization = <
  TAuthClient extends OrganizationAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string,
  options?: ActiveOrganizationOptions<TAuthClient>
) => {
  const { fetchOptions, query, ...queryOptions } = options ?? {}

  return queryClient.prefetchQuery({
    ...activeOrganizationOptions(authClient, userId, { query, fetchOptions }),
    ...queryOptions
  })
}

/**
 * Fetch and cache the active organization, resolving with data or throwing.
 */
export const fetchActiveOrganization = <
  TAuthClient extends OrganizationAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string,
  options?: ActiveOrganizationOptions<TAuthClient>
) => {
  const { fetchOptions, query, ...queryOptions } = options ?? {}

  return queryClient.fetchQuery({
    ...activeOrganizationOptions(authClient, userId, { query, fetchOptions }),
    ...queryOptions
  })
}
/**
 * Read the active organization synchronously from the query cache.
 */
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
