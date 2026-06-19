import { organizationQueryKeys } from "@better-auth-ui/core/plugins"
import { createQuery, type QueryClient } from "@tanstack/solid-query"
import { useSession } from "../../hooks/queries/use-session"
import type { OrganizationAuthClient } from "../../lib/auth-client"
import type { FullOrganizationParams } from "./full-organization-query"
import type { ListOrganizationsData } from "./list-organizations-query"
import { useOrganizationSlug } from "./plugin"
import {
  createOrganizationQueryOptions,
  ensureOrganizationQuery,
  fetchOrganizationQuery,
  prefetchOrganizationQuery,
  skipToken
} from "./utils"

export type ActiveOrganizationData<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> =
  NonNullable<ListOrganizationsData<TAuthClient>> extends Array<infer TOrg>
    ? TOrg | null
    : unknown

export type ActiveOrganizationParams<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = FullOrganizationParams<TAuthClient>

export type ActiveOrganizationOptions<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Omit<
  ReturnType<typeof activeOrganizationOptions<TAuthClient>>,
  "queryKey" | "queryFn"
>

export function activeOrganizationOptions<
  TAuthClient extends OrganizationAuthClient
>(
  authClient: TAuthClient,
  userId: string | undefined,
  params?: ActiveOrganizationParams<TAuthClient>
) {
  return createOrganizationQueryOptions(
    organizationQueryKeys.activeOrganization(userId, params?.query),
    authClient.organization.getFullOrganization,
    params
  )
}

export const ensureActiveOrganization = <
  TAuthClient extends OrganizationAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string | undefined,
  params?: ActiveOrganizationParams<TAuthClient>
) =>
  ensureOrganizationQuery(
    queryClient,
    organizationQueryKeys.activeOrganization(userId, params?.query),
    authClient.organization.getFullOrganization,
    params
  )

export const prefetchActiveOrganization = <
  TAuthClient extends OrganizationAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string | undefined,
  params?: ActiveOrganizationParams<TAuthClient>
) =>
  prefetchOrganizationQuery(
    queryClient,
    organizationQueryKeys.activeOrganization(userId, params?.query),
    authClient.organization.getFullOrganization,
    params
  )

export const fetchActiveOrganization = <
  TAuthClient extends OrganizationAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string | undefined,
  params?: ActiveOrganizationParams<TAuthClient>
) =>
  fetchOrganizationQuery(
    queryClient,
    organizationQueryKeys.activeOrganization(userId, params?.query),
    authClient.organization.getFullOrganization,
    params
  )

export type UseActiveOrganizationOptions<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = ActiveOrganizationOptions<TAuthClient> &
  ActiveOrganizationParams<TAuthClient>

export function useActiveOrganization<
  TAuthClient extends OrganizationAuthClient
>(
  authClient: TAuthClient,
  options: UseActiveOrganizationOptions<TAuthClient> = {}
) {
  const session = useSession(authClient)
  const slug = useOrganizationSlug()

  return createQuery(() => {
    const { query, fetchOptions, ...queryOptionsRest } = options
    const userId = session.data?.user.id
    const effectiveQuery = slug ? { organizationSlug: slug } : query
    const baseOptions = activeOrganizationOptions(authClient, userId, {
      query: effectiveQuery,
      fetchOptions
    } as ActiveOrganizationParams<TAuthClient>)

    return {
      ...queryOptionsRest,
      ...baseOptions,
      queryFn:
        slug === null
          ? async () => null
          : userId
            ? baseOptions.queryFn
            : skipToken
    }
  })
}
