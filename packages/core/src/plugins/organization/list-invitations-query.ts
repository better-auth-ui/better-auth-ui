import {
  type QueryClient,
  type QueryOptions,
  skipToken
} from "@tanstack/query-core"
import type { InferData } from "../../lib/auth-client"
import type { OrganizationAuthClient } from "./organization-auth-client"
import { organizationQueryKeys } from "./organization-query-keys"

export type ListOrganizationInvitationsData<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = InferData<TAuthClient["organization"]["listInvitations"]>

export type ListOrganizationInvitationsParams<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Parameters<TAuthClient["organization"]["listInvitations"]>[0]

export type ListOrganizationInvitationsOptions<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Omit<
  QueryOptions<ListOrganizationInvitationsData<TAuthClient>>,
  "queryKey"
> &
  ListOrganizationInvitationsParams<TAuthClient>

/**
 * Query options factory for organization invitations visible to the current user.
 *
 * @param authClient - The Better Auth organization client.
 * @param userId - The current signed-in user's ID. Used for cache partitioning.
 * @param params - Parameters forwarded to `authClient.organization.listInvitations`.
 */
export function listOrganizationInvitationsOptions<
  TAuthClient extends OrganizationAuthClient
>(
  authClient: TAuthClient,
  userId?: string,
  params?: ListOrganizationInvitationsParams<TAuthClient>
) {
  type TData = ListOrganizationInvitationsData<TAuthClient>
  const queryKey = organizationQueryKeys.invitations.list(userId, params?.query)
  const query = params?.query as { organizationId?: string } | undefined

  return {
    queryKey,
    queryFn:
      userId && query?.organizationId
        ? ({ signal }) =>
            authClient.organization.listInvitations({
              ...params,
              fetchOptions: { ...params?.fetchOptions, signal, throw: true }
            }) as Promise<TData>
        : skipToken
  } satisfies QueryOptions
}

/**
 * Get organization invitations from the cache, fetching if needed.
 */
export const ensureListOrganizationInvitations = <
  TAuthClient extends OrganizationAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId?: string,
  options?: ListOrganizationInvitationsOptions<TAuthClient>
) => {
  const { fetchOptions, query, ...queryOptions } = options ?? {}

  return queryClient.ensureQueryData({
    ...listOrganizationInvitationsOptions(authClient, userId, {
      query,
      fetchOptions
    }),
    ...queryOptions
  })
}

/**
 * Prefetch organization invitations into the query cache.
 */
export const prefetchListOrganizationInvitations = <
  TAuthClient extends OrganizationAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId?: string,
  options?: ListOrganizationInvitationsOptions<TAuthClient>
) => {
  const { fetchOptions, query, ...queryOptions } = options ?? {}

  return queryClient.prefetchQuery({
    ...listOrganizationInvitationsOptions(authClient, userId, {
      query,
      fetchOptions
    }),
    ...queryOptions
  })
}

/**
 * Fetch and cache organization invitations, resolving with data or throwing on error.
 */
export const fetchListOrganizationInvitations = <
  TAuthClient extends OrganizationAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId?: string,
  options?: ListOrganizationInvitationsOptions<TAuthClient>
) => {
  const { fetchOptions, query, ...queryOptions } = options ?? {}

  return queryClient.fetchQuery({
    ...listOrganizationInvitationsOptions(authClient, userId, {
      query,
      fetchOptions
    }),
    ...queryOptions
  })
}
/**
 * Read organization invitations synchronously from the query cache without fetching.
 */
export const getListOrganizationInvitations = <
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
>(
  queryClient: QueryClient,
  _authClient?: TAuthClient,
  userId?: string,
  params?: ListOrganizationInvitationsParams<TAuthClient>
) => {
  const queryKey = organizationQueryKeys.invitations.list(userId, params?.query)
  return queryClient.getQueryData<ListOrganizationInvitationsData<TAuthClient>>(
    queryKey
  )
}
