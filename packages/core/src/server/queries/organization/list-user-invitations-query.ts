import type { QueryClient, QueryOptions } from "@tanstack/query-core"
import { authRequestData, tagQueryKey } from "../../../lib/auth-request-data"
import type { APIError } from "better-auth"
import { organizationQueryKeys } from "../../../plugins/organization"
import type { OrganizationAuthServer } from "../../../plugins/organization/server/organization-auth-server"

export type ListUserInvitationsData<
  TAuth extends OrganizationAuthServer = OrganizationAuthServer
> = Awaited<ReturnType<TAuth["api"]["listUserInvitations"]>>

export type ListUserInvitationsParams<
  TAuth extends OrganizationAuthServer = OrganizationAuthServer
> = Parameters<TAuth["api"]["listUserInvitations"]>[0]

/**
 * Query options factory for invitations addressed to the current user.
 *
 * @param auth - The Better Auth server instance.
 * @param userId - The signed-in user's ID. Used for cache partitioning so
 *   the key matches the client-side `listUserInvitationsOptions` for SSR hydration.
 * @param params - Parameters forwarded to `auth.api.listUserInvitations`.
 */
export function listUserInvitationsOptions<
  TAuth extends OrganizationAuthServer
>(auth: TAuth, userId: string, params: ListUserInvitationsParams<TAuth>) {
  type TData = ListUserInvitationsData<TAuth>
  const queryKey = organizationQueryKeys.userInvitations.list(
    userId,
    params?.query
  )

  return {
    queryKey: tagQueryKey<TData, APIError, typeof queryKey>(queryKey),
    queryFn: () => authRequestData<TData>(auth.api.listUserInvitations(params))
  } satisfies QueryOptions<TData, APIError, TData, typeof queryKey>
}

export const ensureListUserInvitations = <TAuth extends OrganizationAuthServer>(
  queryClient: QueryClient,
  auth: TAuth,
  userId: string,
  params: ListUserInvitationsParams<TAuth>
) =>
  queryClient.ensureQueryData(listUserInvitationsOptions(auth, userId, params))

export const prefetchListUserInvitations = <
  TAuth extends OrganizationAuthServer
>(
  queryClient: QueryClient,
  auth: TAuth,
  userId: string,
  params: ListUserInvitationsParams<TAuth>
) => queryClient.prefetchQuery(listUserInvitationsOptions(auth, userId, params))

export const fetchListUserInvitations = <TAuth extends OrganizationAuthServer>(
  queryClient: QueryClient,
  auth: TAuth,
  userId: string,
  params: ListUserInvitationsParams<TAuth>
) => queryClient.fetchQuery(listUserInvitationsOptions(auth, userId, params))
