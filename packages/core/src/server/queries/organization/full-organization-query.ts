import type { QueryClient, QueryOptions } from "@tanstack/query-core"
import { authRequestData, tagQueryKey } from "../../../lib/auth-request-data"
import type { APIError } from "better-auth"
import { organizationQueryKeys } from "../../../plugins/organization"
import type { OrganizationAuthServer } from "../../../plugins/organization/server/organization-auth-server"

export type FullOrganizationData<
  TAuth extends OrganizationAuthServer = OrganizationAuthServer
> = Awaited<ReturnType<TAuth["api"]["getFullOrganization"]>>

export type FullOrganizationParams<
  TAuth extends OrganizationAuthServer = OrganizationAuthServer
> = Parameters<TAuth["api"]["getFullOrganization"]>[0]

/**
 * Query options factory for full organization details (members, invitations, etc.).
 *
 * @param auth - The Better Auth server instance.
 * @param userId - The signed-in user's ID. Used for cache partitioning so
 *   the key matches the client-side `fullOrganizationOptions` for SSR hydration.
 * @param params - Parameters forwarded to `auth.api.getFullOrganization`.
 */
export function fullOrganizationOptions<TAuth extends OrganizationAuthServer>(
  auth: TAuth,
  userId: string,
  params: FullOrganizationParams<TAuth>
) {
  type TData = FullOrganizationData<TAuth>
  const queryKey = organizationQueryKeys.fullDetail(userId, params?.query)

  return {
    queryKey: tagQueryKey<TData, APIError, typeof queryKey>(queryKey),
    queryFn: () => authRequestData<TData>(auth.api.getFullOrganization(params))
  } satisfies QueryOptions<TData, APIError, TData, typeof queryKey>
}

export const ensureFullOrganization = <TAuth extends OrganizationAuthServer>(
  queryClient: QueryClient,
  auth: TAuth,
  userId: string,
  params: FullOrganizationParams<TAuth>
) => queryClient.ensureQueryData(fullOrganizationOptions(auth, userId, params))

export const prefetchFullOrganization = <TAuth extends OrganizationAuthServer>(
  queryClient: QueryClient,
  auth: TAuth,
  userId: string,
  params: FullOrganizationParams<TAuth>
) => queryClient.prefetchQuery(fullOrganizationOptions(auth, userId, params))

export const fetchFullOrganization = <TAuth extends OrganizationAuthServer>(
  queryClient: QueryClient,
  auth: TAuth,
  userId: string,
  params: FullOrganizationParams<TAuth>
) => queryClient.fetchQuery(fullOrganizationOptions(auth, userId, params))
