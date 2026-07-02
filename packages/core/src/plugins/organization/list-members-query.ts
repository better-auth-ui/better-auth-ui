import {
  type QueryClient,
  type QueryOptions,
  skipToken
} from "@tanstack/query-core"
import type { InferData } from "../../lib/auth-client"
import type { OrganizationAuthClient } from "./organization-auth-client"
import { organizationQueryKeys } from "./organization-query-keys"

export type ListOrganizationMembersData<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = InferData<TAuthClient["organization"]["listMembers"]>

export type ListOrganizationMembersParams<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Parameters<TAuthClient["organization"]["listMembers"]>[0]

export type ListOrganizationMembersOptions<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Omit<QueryOptions<ListOrganizationMembersData<TAuthClient>>, "queryKey"> &
  ListOrganizationMembersParams<TAuthClient>

/**
 * Query options factory for organization members visible to the current user.
 *
 * @param authClient - The Better Auth organization client.
 * @param userId - The current signed-in user's ID. Used for cache partitioning.
 * @param params - Parameters forwarded to `authClient.organization.listMembers`.
 */
export function listOrganizationMembersOptions<
  TAuthClient extends OrganizationAuthClient
>(
  authClient: TAuthClient,
  userId?: string,
  params?: ListOrganizationMembersParams<TAuthClient>
) {
  type TData = ListOrganizationMembersData<TAuthClient>
  const queryKey = organizationQueryKeys.members.list(userId, params?.query)
  const query = params?.query as { organizationId?: string } | undefined

  return {
    queryKey,
    queryFn:
      userId && query?.organizationId
        ? ({ signal }) =>
            authClient.organization.listMembers({
              ...params,
              fetchOptions: { ...params?.fetchOptions, signal, throw: true }
            }) as Promise<TData>
        : skipToken
  } satisfies QueryOptions
}

/**
 * Get organization members from the cache, fetching if needed.
 */
export const ensureListOrganizationMembers = <
  TAuthClient extends OrganizationAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId?: string,
  options?: ListOrganizationMembersOptions<TAuthClient>
) => {
  const { fetchOptions, query, ...queryOptions } = options ?? {}

  return queryClient.ensureQueryData({
    ...listOrganizationMembersOptions(authClient, userId, {
      query,
      fetchOptions
    }),
    ...queryOptions
  })
}

/**
 * Prefetch organization members into the query cache.
 */
export const prefetchListOrganizationMembers = <
  TAuthClient extends OrganizationAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId?: string,
  options?: ListOrganizationMembersOptions<TAuthClient>
) => {
  const { fetchOptions, query, ...queryOptions } = options ?? {}

  return queryClient.prefetchQuery({
    ...listOrganizationMembersOptions(authClient, userId, {
      query,
      fetchOptions
    }),
    ...queryOptions
  })
}

/**
 * Fetch and cache organization members, resolving with data or throwing on error.
 */
export const fetchListOrganizationMembers = <
  TAuthClient extends OrganizationAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId?: string,
  options?: ListOrganizationMembersOptions<TAuthClient>
) => {
  const { fetchOptions, query, ...queryOptions } = options ?? {}

  return queryClient.fetchQuery({
    ...listOrganizationMembersOptions(authClient, userId, {
      query,
      fetchOptions
    }),
    ...queryOptions
  })
}
/**
 * Read organization members synchronously from the query cache without fetching.
 */
export const getListOrganizationMembers = <
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
>(
  queryClient: QueryClient,
  _authClient?: TAuthClient,
  userId?: string,
  params?: ListOrganizationMembersParams<TAuthClient>
) => {
  const queryKey = organizationQueryKeys.members.list(userId, params?.query)
  return queryClient.getQueryData<ListOrganizationMembersData<TAuthClient>>(
    queryKey
  )
}
