import type { QueryClient, QueryOptions } from "@tanstack/query-core"
import { authRequestData, tagQueryKey } from "../../../lib/auth-request-data"
import type { APIError } from "better-auth"
import { organizationQueryKeys } from "../../../plugins/organization"
import type { OrganizationAuthServer } from "../../../plugins/organization/server/organization-auth-server"

export type HasPermissionData<
  TAuth extends OrganizationAuthServer = OrganizationAuthServer
> = Awaited<ReturnType<TAuth["api"]["hasPermission"]>>

export type HasPermissionParams<
  TAuth extends OrganizationAuthServer = OrganizationAuthServer
> = Parameters<TAuth["api"]["hasPermission"]>[0]

/**
 * Query options factory for organization permission checks.
 *
 * @param auth - The Better Auth server instance.
 * @param userId - The signed-in user's ID. Used for cache partitioning so
 *   the key matches the client-side `hasPermissionOptions` for SSR hydration.
 * @param params - Parameters forwarded to `auth.api.hasPermission`.
 */
export function hasPermissionOptions<TAuth extends OrganizationAuthServer>(
  auth: TAuth,
  userId: string,
  params: HasPermissionParams<TAuth>
) {
  type TData = HasPermissionData<TAuth>
  // Same logical payload as the client key (permissions ± organizationId): client
  // strips `fetchOptions`; server keeps that shape under `body`.
  const queryKey = organizationQueryKeys.permissions.has(userId, params?.body)

  return {
    queryKey: tagQueryKey<TData, APIError, typeof queryKey>(queryKey),
    queryFn: () => authRequestData<TData>(auth.api.hasPermission(params))
  } satisfies QueryOptions<TData, APIError, TData, typeof queryKey>
}

export const ensureHasPermission = <TAuth extends OrganizationAuthServer>(
  queryClient: QueryClient,
  auth: TAuth,
  userId: string,
  params: HasPermissionParams<TAuth>
) => queryClient.ensureQueryData(hasPermissionOptions(auth, userId, params))

export const prefetchHasPermission = <TAuth extends OrganizationAuthServer>(
  queryClient: QueryClient,
  auth: TAuth,
  userId: string,
  params: HasPermissionParams<TAuth>
): Promise<void> =>
  queryClient.prefetchQuery(hasPermissionOptions(auth, userId, params))

export const fetchHasPermission = <TAuth extends OrganizationAuthServer>(
  queryClient: QueryClient,
  auth: TAuth,
  userId: string,
  params: HasPermissionParams<TAuth>
): Promise<Awaited<ReturnType<TAuth["api"]["hasPermission"]>>> =>
  queryClient.fetchQuery(hasPermissionOptions(auth, userId, params))
