import { createAuthQueryFetchOptions } from "@better-auth-ui/core"
import { organizationQueryKeys } from "@better-auth-ui/core/plugins"
import {
  type DataTag,
  type QueryClient,
  queryOptions,
  skipToken,
  useQuery
} from "@tanstack/react-query"
import type { BetterFetchError } from "better-auth/react"

import type { InferData, OrganizationAuthClient } from "../../lib/auth-client"
import { useSession } from "../auth/session-query"

export type InvitationData<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = InferData<TAuthClient["organization"]["getInvitation"]>

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
  type TData = InvitationData<TAuthClient>
  const queryKey = organizationQueryKeys.invitations.detail(
    userId,
    params.query
  )

  const options = queryOptions<TData, BetterFetchError, TData, typeof queryKey>(
    {
      queryKey,
      queryFn: ({ signal }) =>
        authClient.organization.getInvitation({
          ...params,
          fetchOptions: createAuthQueryFetchOptions(params.fetchOptions, signal)
        }) as Promise<TData>
    }
  )

  return options as typeof options & {
    queryKey: DataTag<typeof queryKey, TData, BetterFetchError>
  }
}

export const ensureInvitation = <TAuthClient extends OrganizationAuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string | undefined,
  params: InvitationParams<TAuthClient>
) => queryClient.ensureQueryData(invitationOptions(authClient, userId, params))

export const prefetchInvitation = <TAuthClient extends OrganizationAuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string | undefined,
  params: InvitationParams<TAuthClient>
) => queryClient.prefetchQuery(invitationOptions(authClient, userId, params))

export const fetchInvitation = <TAuthClient extends OrganizationAuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string | undefined,
  params: InvitationParams<TAuthClient>
) => queryClient.fetchQuery(invitationOptions(authClient, userId, params))

export type UseInvitationOptions<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = InvitationOptions<TAuthClient> & InvitationParams<TAuthClient>

export function useInvitation<TAuthClient extends OrganizationAuthClient>(
  authClient: TAuthClient,
  options: UseInvitationOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  const { data: session } = useSession(authClient, undefined, queryClient)
  const userId = session?.user.id
  const { query, fetchOptions, ...queryOptions } = options
  const baseOptions = invitationOptions(authClient, userId, {
    query,
    fetchOptions
  })

  return useQuery(
    {
      ...queryOptions,
      ...baseOptions,
      queryFn: userId && query.id ? baseOptions.queryFn : skipToken
    },
    queryClient
  )
}
