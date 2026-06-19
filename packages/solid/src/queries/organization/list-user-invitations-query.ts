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

export type ListUserInvitationsData<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Awaited<ReturnType<TAuthClient["organization"]["listUserInvitations"]>>

export type ListUserInvitationsParams<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Parameters<TAuthClient["organization"]["listUserInvitations"]>[0]

export type ListUserInvitationsOptions<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Omit<
  ReturnType<typeof listUserInvitationsOptions<TAuthClient>>,
  "queryKey" | "queryFn"
>

export function listUserInvitationsOptions<
  TAuthClient extends OrganizationAuthClient
>(
  authClient: TAuthClient,
  userId: string | undefined,
  params?: ListUserInvitationsParams<TAuthClient>
) {
  return createOrganizationQueryOptions(
    organizationQueryKeys.userInvitations.list(userId, params?.query),
    authClient.organization.listUserInvitations,
    params
  )
}

export const ensureListUserInvitations = <
  TAuthClient extends OrganizationAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string | undefined,
  params?: ListUserInvitationsParams<TAuthClient>
) =>
  ensureOrganizationQuery(
    queryClient,
    organizationQueryKeys.userInvitations.list(userId, params?.query),
    authClient.organization.listUserInvitations,
    params
  )

export const prefetchListUserInvitations = <
  TAuthClient extends OrganizationAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string | undefined,
  params?: ListUserInvitationsParams<TAuthClient>
) =>
  prefetchOrganizationQuery(
    queryClient,
    organizationQueryKeys.userInvitations.list(userId, params?.query),
    authClient.organization.listUserInvitations,
    params
  )

export const fetchListUserInvitations = <
  TAuthClient extends OrganizationAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string | undefined,
  params?: ListUserInvitationsParams<TAuthClient>
) =>
  fetchOrganizationQuery(
    queryClient,
    organizationQueryKeys.userInvitations.list(userId, params?.query),
    authClient.organization.listUserInvitations,
    params
  )

export type UseListUserInvitationsOptions<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = ListUserInvitationsOptions<TAuthClient> &
  ListUserInvitationsParams<TAuthClient>

export function useListUserInvitations<
  TAuthClient extends OrganizationAuthClient
>(
  authClient: TAuthClient,
  options: UseListUserInvitationsOptions<TAuthClient> = {}
) {
  const session = useSession(authClient)
  const { query, fetchOptions, ...queryOptionsRest } = options

  return createQuery(() => {
    const userId = session.data?.user.id
    const baseOptions = listUserInvitationsOptions(authClient, userId, {
      query,
      fetchOptions
    } as ListUserInvitationsParams<TAuthClient>)

    return {
      ...queryOptionsRest,
      ...baseOptions,
      queryFn: userId ? baseOptions.queryFn : skipToken
    }
  })
}
