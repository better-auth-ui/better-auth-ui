import { organizationQueryKeys } from "@better-auth-ui/core/plugins"
import { createQuery, type QueryClient } from "@tanstack/solid-query"

import type { OrganizationAuthClient } from "../../lib/auth-client"
import { useSession } from "../auth/session-query"
import {
  createOrganizationQueryOptions,
  ensureOrganizationQuery,
  fetchOrganizationQuery,
  prefetchOrganizationQuery,
  skipToken
} from "./utils"

export type InvitationData<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Awaited<ReturnType<TAuthClient["organization"]["getInvitation"]>>

export type InvitationParams<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Parameters<TAuthClient["organization"]["getInvitation"]>[0]

export type InvitationOptions<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Omit<
  ReturnType<typeof invitationOptions<TAuthClient>>,
  "queryKey" | "queryFn"
>

export function invitationOptions<TAuthClient extends OrganizationAuthClient>(
  authClient: TAuthClient,
  userId: string | undefined,
  params: InvitationParams<TAuthClient>
) {
  return createOrganizationQueryOptions(
    organizationQueryKeys.invitations.detail(userId, params.query),
    authClient.organization.getInvitation,
    params
  )
}

export const ensureInvitation = <TAuthClient extends OrganizationAuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string | undefined,
  params: InvitationParams<TAuthClient>
) =>
  ensureOrganizationQuery(
    queryClient,
    organizationQueryKeys.invitations.detail(userId, params.query),
    authClient.organization.getInvitation,
    params
  )

export const prefetchInvitation = <TAuthClient extends OrganizationAuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string | undefined,
  params: InvitationParams<TAuthClient>
) =>
  prefetchOrganizationQuery(
    queryClient,
    organizationQueryKeys.invitations.detail(userId, params.query),
    authClient.organization.getInvitation,
    params
  )

export const fetchInvitation = <TAuthClient extends OrganizationAuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string | undefined,
  params: InvitationParams<TAuthClient>
) =>
  fetchOrganizationQuery(
    queryClient,
    organizationQueryKeys.invitations.detail(userId, params.query),
    authClient.organization.getInvitation,
    params
  )

export type UseInvitationOptions<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = InvitationOptions<TAuthClient> & InvitationParams<TAuthClient>

export function useInvitation<TAuthClient extends OrganizationAuthClient>(
  authClient: TAuthClient,
  options: UseInvitationOptions<TAuthClient>
) {
  const session = useSession(authClient)

  return createQuery(() => {
    const { query, fetchOptions, ...queryOptionsRest } = options
    const userId = session.data?.user.id
    const baseOptions = invitationOptions(authClient, userId, {
      query,
      fetchOptions
    })

    return {
      ...queryOptionsRest,
      ...baseOptions,
      queryFn: userId && query.id ? baseOptions.queryFn : skipToken
    }
  })
}
