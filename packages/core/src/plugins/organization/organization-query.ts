import {
  type QueryClient,
  type QueryOptions,
  skipToken
} from "@tanstack/query-core"
import type { InferData } from "../../lib/auth-client"
import { createAuthQueryFetchOptions } from "../../lib/auth-query-retry"
import type { OrganizationAuthClient } from "./organization-auth-client"
import { organizationQueryKeys } from "./organization-query-keys"

/** Data returned by the Better Auth organization detail endpoint. */
export type OrganizationData<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = InferData<TAuthClient["organization"]["getOrganization"]>

/** Parameters accepted by the Better Auth organization detail endpoint. */
export type OrganizationParams<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Parameters<TAuthClient["organization"]["getOrganization"]>[0]

/** Query options for fetching one organization. */
export type OrganizationOptions<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Omit<QueryOptions<OrganizationData<TAuthClient>>, "queryFn" | "queryKey"> &
  OrganizationParams<TAuthClient>

/**
 * Query options factory for an organization selected by ID or slug.
 *
 * An explicit organization is required so the query never depends on Better
 * Auth's active-organization state.
 */
export function organizationOptions<TAuthClient extends OrganizationAuthClient>(
  authClient: TAuthClient,
  userId?: string,
  params?: OrganizationParams<TAuthClient>
) {
  type TData = OrganizationData<TAuthClient>
  const query = params?.query as
    | { organizationId?: string; organizationSlug?: string }
    | undefined
  const queryKey = organizationQueryKeys.detail(userId, query)

  return {
    queryKey,
    queryFn:
      userId && (query?.organizationId || query?.organizationSlug)
        ? ({ signal }) =>
            authClient.organization.getOrganization({
              ...params,
              fetchOptions: createAuthQueryFetchOptions(
                params?.fetchOptions,
                signal
              )
            }) as Promise<TData>
        : skipToken
  } satisfies QueryOptions
}

/** Get an organization from cache, fetching it if needed. */
export const ensureOrganization = <TAuthClient extends OrganizationAuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string,
  options: OrganizationOptions<TAuthClient>
) => {
  const { fetchOptions, query, ...queryOptions } = options

  return queryClient.ensureQueryData({
    ...queryOptions,
    ...organizationOptions(authClient, userId, { query, fetchOptions })
  })
}

/** Prefetch an organization into the query cache. */
export const prefetchOrganization = <
  TAuthClient extends OrganizationAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string,
  options: OrganizationOptions<TAuthClient>
) => {
  const { fetchOptions, query, ...queryOptions } = options

  return queryClient.prefetchQuery({
    ...queryOptions,
    ...organizationOptions(authClient, userId, { query, fetchOptions })
  })
}

/** Fetch and cache an organization, resolving with data or throwing. */
export const fetchOrganization = <TAuthClient extends OrganizationAuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string,
  options: OrganizationOptions<TAuthClient>
) => {
  const { fetchOptions, query, ...queryOptions } = options

  return queryClient.fetchQuery({
    ...queryOptions,
    ...organizationOptions(authClient, userId, { query, fetchOptions })
  })
}
