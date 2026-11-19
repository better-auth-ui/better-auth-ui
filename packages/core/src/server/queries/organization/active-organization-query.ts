import type { QueryClient, QueryOptions } from "@tanstack/query-core"
import { authRequestData, tagQueryKey } from "../../../lib/auth-request-data"
import type { APIError } from "better-auth"
import { organizationQueryKeys } from "../../../plugins/organization"
import type { OrganizationAuthServer } from "../../../plugins/organization/server/organization-auth-server"

import type { FullOrganizationParams } from "./full-organization-query"
import type { ListOrganization } from "./list-organizations-query"

/**
 * Cache shape for the active organization. Intentionally narrowed to
 * {@link ListOrganization} (basic fields only) so the cache stays
 * compatible with `setActive`'s optimistic update, which can only produce
 * list-shaped data. Use {@link FullOrganizationData} (via
 * `fullOrganizationOptions`) when you need members / invitations.
 */
export type ActiveOrganizationData<
  TAuth extends OrganizationAuthServer = OrganizationAuthServer
> = ListOrganization<TAuth> | null

/**
 * Same shape as {@link FullOrganizationParams} so server-side prefetches
 * can target a specific organization (e.g. by `query.organizationSlug` for
 * slug-driven routes) and produce a cache key that matches the client's
 * `useActiveOrganization({ query: { organizationSlug } })` on hydration.
 */
export type ActiveOrganizationParams<
  TAuth extends OrganizationAuthServer = OrganizationAuthServer
> = FullOrganizationParams<TAuth>

/**
 * Query options factory for the active organization. Shares its cache key
 * with the client-side `activeOrganizationOptions` (including any
 * `params.query` partition such as `{ organizationSlug }`) so SSR-prefetched
 * data hydrates without a refetch — even on slug-prefixed routes.
 *
 * @param auth - The Better Auth server instance.
 * @param userId - The signed-in user's ID. Used for cache partitioning so
 *   the key matches the client-side `activeOrganizationOptions` for SSR hydration.
 * @param params - Parameters forwarded to `auth.api.getFullOrganization`. Pass
 *   `{ query: { organizationSlug } }` for slug-driven prefetches.
 */
export function activeOrganizationOptions<TAuth extends OrganizationAuthServer>(
  auth: TAuth,
  userId: string,
  params: ActiveOrganizationParams<TAuth>
) {
  type TData = ActiveOrganizationData<TAuth>
  const queryKey = organizationQueryKeys.activeOrganization(
    userId,
    params?.query
  )

  return {
    queryKey: tagQueryKey<TData, APIError, typeof queryKey>(queryKey),
    queryFn: () => authRequestData<TData>(auth.api.getFullOrganization(params))
  } satisfies QueryOptions<TData, APIError, TData, typeof queryKey>
}

export const ensureActiveOrganization = <TAuth extends OrganizationAuthServer>(
  queryClient: QueryClient,
  auth: TAuth,
  userId: string,
  params: ActiveOrganizationParams<TAuth>
) =>
  queryClient.ensureQueryData(activeOrganizationOptions(auth, userId, params))

export const prefetchActiveOrganization = <
  TAuth extends OrganizationAuthServer
>(
  queryClient: QueryClient,
  auth: TAuth,
  userId: string,
  params: ActiveOrganizationParams<TAuth>
): Promise<void> =>
  queryClient.prefetchQuery(activeOrganizationOptions(auth, userId, params))

export const fetchActiveOrganization = <TAuth extends OrganizationAuthServer>(
  queryClient: QueryClient,
  auth: TAuth,
  userId: string,
  params: ActiveOrganizationParams<TAuth>
): Promise<ActiveOrganizationData<TAuth>> =>
  queryClient.fetchQuery(activeOrganizationOptions(auth, userId, params))
