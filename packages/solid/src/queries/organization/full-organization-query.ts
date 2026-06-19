import { organizationQueryKeys } from "@better-auth-ui/core/plugins"
import { createQuery, type QueryClient } from "@tanstack/solid-query"
import { useSession } from "../../hooks/queries/use-session"
import type { OrganizationAuthClient } from "../../lib/auth-client"
import {
  createOrganizationQueryOptions,
  ensureOrganizationQuery,
  fetchOrganizationQuery,
  prefetchOrganizationQuery,
  skipToken
} from "./utils"

export type FullOrganizationData<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Awaited<ReturnType<TAuthClient["organization"]["getFullOrganization"]>>

export type FullOrganizationParams<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Parameters<TAuthClient["organization"]["getFullOrganization"]>[0]

export type FullOrganizationOptions<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Omit<
  ReturnType<typeof fullOrganizationOptions<TAuthClient>>,
  "queryKey" | "queryFn"
>

export function fullOrganizationOptions<
  TAuthClient extends OrganizationAuthClient
>(
  authClient: TAuthClient,
  userId: string | undefined,
  params?: FullOrganizationParams<TAuthClient>
) {
  return createOrganizationQueryOptions(
    organizationQueryKeys.fullDetail(userId, params?.query),
    authClient.organization.getFullOrganization,
    params
  )
}

export const ensureFullOrganization = <
  TAuthClient extends OrganizationAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string | undefined,
  params?: FullOrganizationParams<TAuthClient>
) =>
  ensureOrganizationQuery(
    queryClient,
    organizationQueryKeys.fullDetail(userId, params?.query),
    authClient.organization.getFullOrganization,
    params
  )

export const prefetchFullOrganization = <
  TAuthClient extends OrganizationAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string | undefined,
  params?: FullOrganizationParams<TAuthClient>
) =>
  prefetchOrganizationQuery(
    queryClient,
    organizationQueryKeys.fullDetail(userId, params?.query),
    authClient.organization.getFullOrganization,
    params
  )

export const fetchFullOrganization = <
  TAuthClient extends OrganizationAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string | undefined,
  params?: FullOrganizationParams<TAuthClient>
) =>
  fetchOrganizationQuery(
    queryClient,
    organizationQueryKeys.fullDetail(userId, params?.query),
    authClient.organization.getFullOrganization,
    params
  )

export type UseFullOrganizationOptions<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = FullOrganizationOptions<TAuthClient> & FullOrganizationParams<TAuthClient>

export function useFullOrganization<TAuthClient extends OrganizationAuthClient>(
  authClient: TAuthClient,
  options: UseFullOrganizationOptions<TAuthClient> = {}
) {
  const session = useSession(authClient)

  return createQuery(() => {
    const { query, fetchOptions, ...queryOptionsRest } = options
    const userId = session.data?.user.id
    const baseOptions = fullOrganizationOptions(authClient, userId, {
      query,
      fetchOptions
    } as FullOrganizationParams<TAuthClient>)

    return {
      ...queryOptionsRest,
      ...baseOptions,
      queryFn: userId ? baseOptions.queryFn : skipToken
    }
  })
}
