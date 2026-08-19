import {
  type QueryClient,
  type QueryOptions,
  skipToken
} from "@tanstack/query-core"
import type { InferData } from "../../lib/auth-client"
import { createAuthQueryFetchOptions } from "../../lib/auth-query-retry"
import type { OrganizationAuthClient } from "./organization-auth-client"
import { organizationQueryKeys } from "./organization-query-keys"

export type ActiveMemberRoleData<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = InferData<TAuthClient["organization"]["getActiveMemberRole"]>

export type ActiveMemberRoleParams<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Parameters<TAuthClient["organization"]["getActiveMemberRole"]>[0]

export type ActiveMemberRoleOptions<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Omit<QueryOptions<ActiveMemberRoleData<TAuthClient>>, "queryKey"> &
  ActiveMemberRoleParams<TAuthClient>

/**
 * Query options factory for the signed-in user's own role in an organization.
 *
 * Prefer this over scanning `listMembers` for the current user: once the
 * member list is paginated, the signed-in user may not be on the page that
 * happens to be loaded.
 *
 * @param authClient - The Better Auth organization client.
 * @param userId - The current signed-in user's ID. Used for cache partitioning.
 * @param params - Parameters forwarded to `authClient.organization.getActiveMemberRole`.
 */
export function activeMemberRoleOptions<
  TAuthClient extends OrganizationAuthClient
>(
  authClient: TAuthClient,
  userId?: string,
  params?: ActiveMemberRoleParams<TAuthClient>
) {
  type TData = ActiveMemberRoleData<TAuthClient>
  const queryKey = organizationQueryKeys.members.activeRole(
    userId,
    params?.query
  )
  const query = params?.query as
    | { organizationId?: string; organizationSlug?: string }
    | undefined

  return {
    queryKey,
    queryFn:
      userId && (query?.organizationId || query?.organizationSlug)
        ? ({ signal }) =>
            authClient.organization.getActiveMemberRole({
              ...params,
              fetchOptions: createAuthQueryFetchOptions(
                params?.fetchOptions,
                signal
              )
            }) as Promise<TData>
        : skipToken
  } satisfies QueryOptions
}

/**
 * Get the signed-in user's organization role from the cache, fetching if needed.
 */
export const ensureActiveMemberRole = <
  TAuthClient extends OrganizationAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string,
  options?: ActiveMemberRoleOptions<TAuthClient>
) => {
  const { fetchOptions, query, ...queryOptions } = options ?? {}

  return queryClient.ensureQueryData({
    ...activeMemberRoleOptions(authClient, userId, { query, fetchOptions }),
    ...queryOptions
  })
}
