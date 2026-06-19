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

export type ListOrganizationInvitationsData<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Awaited<ReturnType<TAuthClient["organization"]["listInvitations"]>>

export type ListOrganizationInvitationsParams<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Parameters<TAuthClient["organization"]["listInvitations"]>[0]

export type ListOrganizationInvitationsOptions<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Omit<
  ReturnType<typeof listOrganizationInvitationsOptions<TAuthClient>>,
  "queryKey" | "queryFn"
>

export function listOrganizationInvitationsOptions<
  TAuthClient extends OrganizationAuthClient
>(
  authClient: TAuthClient,
  userId: string | undefined,
  params?: ListOrganizationInvitationsParams<TAuthClient>
) {
  return createOrganizationQueryOptions(
    organizationQueryKeys.invitations.list(userId, params?.query),
    authClient.organization.listInvitations,
    params
  )
}

export const ensureListOrganizationInvitations = <
  TAuthClient extends OrganizationAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string | undefined,
  params?: ListOrganizationInvitationsParams<TAuthClient>
) =>
  ensureOrganizationQuery(
    queryClient,
    organizationQueryKeys.invitations.list(userId, params?.query),
    authClient.organization.listInvitations,
    params
  )

export const prefetchListOrganizationInvitations = <
  TAuthClient extends OrganizationAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string | undefined,
  params?: ListOrganizationInvitationsParams<TAuthClient>
) =>
  prefetchOrganizationQuery(
    queryClient,
    organizationQueryKeys.invitations.list(userId, params?.query),
    authClient.organization.listInvitations,
    params
  )

export const fetchListOrganizationInvitations = <
  TAuthClient extends OrganizationAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string | undefined,
  params?: ListOrganizationInvitationsParams<TAuthClient>
) =>
  fetchOrganizationQuery(
    queryClient,
    organizationQueryKeys.invitations.list(userId, params?.query),
    authClient.organization.listInvitations,
    params
  )

export type UseListOrganizationInvitationsOptions<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = ListOrganizationInvitationsOptions<TAuthClient> &
  ListOrganizationInvitationsParams<TAuthClient>

export function useListOrganizationInvitations<
  TAuthClient extends OrganizationAuthClient
>(
  authClient: TAuthClient,
  options: UseListOrganizationInvitationsOptions<TAuthClient> = {}
) {
  const session = useSession(authClient)
  const { query, fetchOptions, ...queryOptionsRest } = options
  const activeOrganization = useActiveOrganization(authClient, {
    enabled: !query?.organizationId
  } as never)

  return createQuery(() => {
    const userId = session.data?.user.id
    const organizationId = query?.organizationId ?? activeOrganization.data?.id
    const params = {
      query: { ...query, organizationId },
      fetchOptions
    } as ListOrganizationInvitationsParams<TAuthClient>
    const baseOptions = listOrganizationInvitationsOptions(
      authClient,
      userId,
      params
    )

    return {
      ...queryOptionsRest,
      ...baseOptions,
      queryFn: userId && organizationId ? baseOptions.queryFn : skipToken
    }
  })
}
