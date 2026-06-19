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

export type ListOrganizationsData<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Awaited<ReturnType<TAuthClient["organization"]["list"]>>

export type ListOrganizationsParams<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Parameters<TAuthClient["organization"]["list"]>[0]

export type ListOrganizationsOptions<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Omit<
  ReturnType<typeof listOrganizationsOptions<TAuthClient>>,
  "queryKey" | "queryFn"
>

export function listOrganizationsOptions<
  TAuthClient extends OrganizationAuthClient
>(
  authClient: TAuthClient,
  userId: string | undefined,
  params?: ListOrganizationsParams<TAuthClient>
) {
  return createOrganizationQueryOptions(
    organizationQueryKeys.list(userId, params?.query),
    authClient.organization.list,
    params
  )
}

export const ensureListOrganizations = <
  TAuthClient extends OrganizationAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string | undefined,
  params?: ListOrganizationsParams<TAuthClient>
) =>
  ensureOrganizationQuery(
    queryClient,
    organizationQueryKeys.list(userId, params?.query),
    authClient.organization.list,
    params
  )

export const prefetchListOrganizations = <
  TAuthClient extends OrganizationAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string | undefined,
  params?: ListOrganizationsParams<TAuthClient>
) =>
  prefetchOrganizationQuery(
    queryClient,
    organizationQueryKeys.list(userId, params?.query),
    authClient.organization.list,
    params
  )

export const fetchListOrganizations = <
  TAuthClient extends OrganizationAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string | undefined,
  params?: ListOrganizationsParams<TAuthClient>
) =>
  fetchOrganizationQuery(
    queryClient,
    organizationQueryKeys.list(userId, params?.query),
    authClient.organization.list,
    params
  )

export type UseListOrganizationsOptions<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = ListOrganizationsOptions<TAuthClient> & ListOrganizationsParams<TAuthClient>

export function useListOrganizations<
  TAuthClient extends OrganizationAuthClient
>(
  authClient: TAuthClient,
  options: UseListOrganizationsOptions<TAuthClient> = {}
) {
  const session = useSession(authClient)

  return createQuery(() => {
    const { query, fetchOptions, ...queryOptionsRest } = options
    const userId = session.data?.user.id
    const baseOptions = listOrganizationsOptions(authClient, userId, {
      query,
      fetchOptions
    } as ListOrganizationsParams<TAuthClient>)

    return {
      ...queryOptionsRest,
      ...baseOptions,
      queryFn: userId ? baseOptions.queryFn : skipToken
    }
  })
}
