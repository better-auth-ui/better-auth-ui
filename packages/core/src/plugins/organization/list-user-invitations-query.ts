import {
  type QueryClient,
  type QueryOptions,
  skipToken
} from "@tanstack/query-core"
import type { InferData } from "../../lib/auth-client"
import type { OrganizationAuthClient } from "./organization-auth-client"
import { organizationQueryKeys } from "./organization-query-keys"

export type ListUserInvitationsData<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = InferData<TAuthClient["organization"]["listUserInvitations"]>

export type ListUserInvitationsParams<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Parameters<TAuthClient["organization"]["listUserInvitations"]>[0]

export type ListUserInvitationsOptions<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Omit<QueryOptions<ListUserInvitationsData<TAuthClient>>, "queryKey"> &
  ListUserInvitationsParams<TAuthClient>

/**
 * Query options factory for invitations addressed to the current user.
 *
 * @param authClient - The Better Auth organization client.
 * @param userId - The current signed-in user's ID. Used for cache partitioning.
 * @param params - Parameters forwarded to `authClient.organization.listUserInvitations`.
 */
export function listUserInvitationsOptions<
  TAuthClient extends OrganizationAuthClient
>(
  authClient: TAuthClient,
  userId?: string,
  params?: ListUserInvitationsParams<TAuthClient>
) {
  type TData = ListUserInvitationsData<TAuthClient>
  const queryKey = organizationQueryKeys.userInvitations.list(
    userId,
    params?.query
  )

  return {
    queryKey,
    queryFn: userId
      ? ({ signal }) =>
          authClient.organization.listUserInvitations({
            ...params,
            fetchOptions: { ...params?.fetchOptions, signal, throw: true }
          }) as Promise<TData>
      : skipToken
  } satisfies QueryOptions
}

/**
 * Get user invitations from the cache, fetching if needed.
 */
export const ensureListUserInvitations = <
  TAuthClient extends OrganizationAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId?: string,
  options?: ListUserInvitationsOptions<TAuthClient>
) => {
  const { fetchOptions, query, ...queryOptions } = options ?? {}

  return queryClient.ensureQueryData({
    ...listUserInvitationsOptions(authClient, userId, { query, fetchOptions }),
    ...queryOptions
  })
}

/**
 * Prefetch user invitations into the query cache.
 */
export const prefetchListUserInvitations = <
  TAuthClient extends OrganizationAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId?: string,
  options?: ListUserInvitationsOptions<TAuthClient>
) => {
  const { fetchOptions, query, ...queryOptions } = options ?? {}

  return queryClient.prefetchQuery({
    ...listUserInvitationsOptions(authClient, userId, { query, fetchOptions }),
    ...queryOptions
  })
}

/**
 * Fetch and cache user invitations, resolving with data or throwing on error.
 */
export const fetchListUserInvitations = <
  TAuthClient extends OrganizationAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId?: string,
  options?: ListUserInvitationsOptions<TAuthClient>
) => {
  const { fetchOptions, query, ...queryOptions } = options ?? {}

  return queryClient.fetchQuery({
    ...listUserInvitationsOptions(authClient, userId, { query, fetchOptions }),
    ...queryOptions
  })
}
/**
 * Read user invitations synchronously from the query cache without fetching.
 */
export const getListUserInvitations = <
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
>(
  queryClient: QueryClient,
  _authClient?: TAuthClient,
  userId?: string,
  params?: ListUserInvitationsParams<TAuthClient>
) => {
  const queryKey = organizationQueryKeys.userInvitations.list(
    userId,
    params?.query
  )
  return queryClient.getQueryData<ListUserInvitationsData<TAuthClient>>(
    queryKey
  )
}
