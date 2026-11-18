import type { QueryClient, QueryOptions } from "@tanstack/query-core"
import { authRequestData, tagQueryKey } from "../../../lib/auth-request-data"
import type { APIError } from "better-auth"
import { organizationQueryKeys } from "../../../plugins/organization"
import type { OrganizationAuthServer } from "../../../plugins/organization/server/organization-auth-server"

export type ListOrganizationMembersData<
  TAuth extends OrganizationAuthServer = OrganizationAuthServer
> = Awaited<ReturnType<TAuth["api"]["listMembers"]>>

export type ListOrganizationMembersParams<
  TAuth extends OrganizationAuthServer = OrganizationAuthServer
> = Parameters<TAuth["api"]["listMembers"]>[0]

/**
 * Query options factory for members of an organization.
 *
 * @param auth - The Better Auth server instance.
 * @param userId - The signed-in user's ID. Used for cache partitioning so
 *   the key matches the client-side `listOrganizationMembersOptions` for SSR hydration.
 * @param params - Parameters forwarded to `auth.api.listMembers`.
 */
export function listOrganizationMembersOptions<
  TAuth extends OrganizationAuthServer
>(auth: TAuth, userId: string, params: ListOrganizationMembersParams<TAuth>) {
  type TData = ListOrganizationMembersData<TAuth>
  const queryKey = organizationQueryKeys.members.list(userId, params?.query)

  return {
    queryKey: tagQueryKey<TData, APIError, typeof queryKey>(queryKey),
    queryFn: () => authRequestData<TData>(auth.api.listMembers(params))
  } satisfies QueryOptions<TData, APIError, TData, typeof queryKey>
}

export const ensureListOrganizationMembers = <
  TAuth extends OrganizationAuthServer
>(
  queryClient: QueryClient,
  auth: TAuth,
  userId: string,
  params: ListOrganizationMembersParams<TAuth>
) =>
  queryClient.ensureQueryData(
    listOrganizationMembersOptions(auth, userId, params)
  )

export const prefetchListOrganizationMembers = <
  TAuth extends OrganizationAuthServer
>(
  queryClient: QueryClient,
  auth: TAuth,
  userId: string,
  params: ListOrganizationMembersParams<TAuth>
) =>
  queryClient.prefetchQuery(
    listOrganizationMembersOptions(auth, userId, params)
  )

export const fetchListOrganizationMembers = <
  TAuth extends OrganizationAuthServer
>(
  queryClient: QueryClient,
  auth: TAuth,
  userId: string,
  params: ListOrganizationMembersParams<TAuth>
) =>
  queryClient.fetchQuery(listOrganizationMembersOptions(auth, userId, params))
