import { organizationQueryKeys } from "@better-auth-ui/core/plugins"
import { createQuery, type QueryClient } from "@tanstack/solid-query"
import { useSession } from "../../hooks/queries/use-session"
import type { OrganizationAuthClient } from "../../lib/auth-client"
import { useActiveOrganization } from "./active-organization-query"
import {
  createOrganizationQueryOptions,
  ensureOrganizationQuery,
  fetchOrganizationQuery,
  prefetchOrganizationQuery,
  skipToken
} from "./utils"

export type HasPermissionData<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Awaited<ReturnType<TAuthClient["organization"]["hasPermission"]>>

export type HasPermissionParams<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Parameters<TAuthClient["organization"]["hasPermission"]>[0]

export type HasPermissionOptions<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Omit<
  ReturnType<typeof hasPermissionOptions<TAuthClient>>,
  "queryKey" | "queryFn"
>

export function hasPermissionOptions<
  TAuthClient extends OrganizationAuthClient
>(
  authClient: TAuthClient,
  userId: string | undefined,
  params: HasPermissionParams<TAuthClient>
) {
  const { fetchOptions, ...query } = params

  return createOrganizationQueryOptions(
    organizationQueryKeys.permissions.has(userId, query),
    authClient.organization.hasPermission,
    { ...query, fetchOptions } as HasPermissionParams<TAuthClient>
  )
}

export const ensureHasPermission = <TAuthClient extends OrganizationAuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string | undefined,
  params: HasPermissionParams<TAuthClient>
) =>
  ensureOrganizationQuery(
    queryClient,
    hasPermissionOptions(authClient, userId, params).queryKey,
    authClient.organization.hasPermission,
    params
  )

export const prefetchHasPermission = <
  TAuthClient extends OrganizationAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string | undefined,
  params: HasPermissionParams<TAuthClient>
) =>
  prefetchOrganizationQuery(
    queryClient,
    hasPermissionOptions(authClient, userId, params).queryKey,
    authClient.organization.hasPermission,
    params
  )

export const fetchHasPermission = <TAuthClient extends OrganizationAuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string | undefined,
  params: HasPermissionParams<TAuthClient>
) =>
  fetchOrganizationQuery(
    queryClient,
    hasPermissionOptions(authClient, userId, params).queryKey,
    authClient.organization.hasPermission,
    params
  )

export type UseHasPermissionOptions<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = HasPermissionOptions<TAuthClient> & HasPermissionParams<TAuthClient>

export function useHasPermission<TAuthClient extends OrganizationAuthClient>(
  authClient: TAuthClient,
  options: UseHasPermissionOptions<TAuthClient>
) {
  const session = useSession(authClient)
  const activeOrganization = useActiveOrganization(authClient, {
    enabled: !options.organizationId
  } as never)

  return createQuery(() => {
    const {
      fetchOptions,
      permissions,
      organizationId: optionsOrganizationId,
      ...queryOptionsRest
    } = options
    const userId = session.data?.user.id
    const organizationId = optionsOrganizationId ?? activeOrganization.data?.id
    const params = {
      fetchOptions,
      organizationId,
      permissions
    } as HasPermissionParams<TAuthClient>
    const baseOptions = hasPermissionOptions(authClient, userId, params)

    return {
      ...queryOptionsRest,
      ...baseOptions,
      queryFn: userId && organizationId ? baseOptions.queryFn : skipToken
    }
  })
}
