import { organizationQueryKeys } from "@better-auth-ui/core/plugins"
import {
  type DataTag,
  type QueryClient,
  queryOptions
} from "@tanstack/react-query"
import type { APIError } from "better-auth"

import type { OrganizationAuthServer } from "../../../lib/auth-server"

export type InvitationData<
  TAuth extends OrganizationAuthServer = OrganizationAuthServer
> = Awaited<ReturnType<TAuth["api"]["getInvitation"]>>

export type InvitationParams<
  TAuth extends OrganizationAuthServer = OrganizationAuthServer
> = Parameters<TAuth["api"]["getInvitation"]>[0]

/** Query options for an invitation addressed to the signed-in user. */
export function invitationOptions<TAuth extends OrganizationAuthServer>(
  auth: TAuth,
  userId: string,
  params: InvitationParams<TAuth>
) {
  type TData = InvitationData<TAuth>
  const queryKey = organizationQueryKeys.invitations.detail(
    userId,
    params?.query
  )

  const options = queryOptions<TData, APIError, TData, typeof queryKey>({
    queryKey,
    queryFn: () => auth.api.getInvitation(params) as Promise<TData>
  })

  return options as typeof options & {
    queryKey: DataTag<typeof queryKey, TData, APIError>
  }
}

export const ensureInvitation = <TAuth extends OrganizationAuthServer>(
  queryClient: QueryClient,
  auth: TAuth,
  userId: string,
  params: InvitationParams<TAuth>
) => queryClient.ensureQueryData(invitationOptions(auth, userId, params))

export const prefetchInvitation = <TAuth extends OrganizationAuthServer>(
  queryClient: QueryClient,
  auth: TAuth,
  userId: string,
  params: InvitationParams<TAuth>
) => queryClient.prefetchQuery(invitationOptions(auth, userId, params))

export const fetchInvitation = <TAuth extends OrganizationAuthServer>(
  queryClient: QueryClient,
  auth: TAuth,
  userId: string,
  params: InvitationParams<TAuth>
) => queryClient.fetchQuery(invitationOptions(auth, userId, params))
