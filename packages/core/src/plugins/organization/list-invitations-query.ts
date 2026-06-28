import {
  type QueryClient,
  type QueryOptions,
  skipToken
} from "@tanstack/query-core"
import type { InferData } from "../../lib/auth-client"
import type { OrganizationAuthClient } from "./organization-auth-client"
import { organizationQueryKeys } from "./organization-query-keys"

export type ListOrganizationInvitationsData<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = InferData<TAuthClient["organization"]["listInvitations"]>

export type ListOrganizationInvitationsParams<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Parameters<TAuthClient["organization"]["listInvitations"]>[0]

export type ListOrganizationInvitationsOptions<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Omit<
  QueryOptions<ListOrganizationInvitationsData<TAuthClient>>,
  "queryKey"
> &
  ListOrganizationInvitationsParams<TAuthClient>

export function listOrganizationInvitationsOptions<
  TAuthClient extends OrganizationAuthClient
>(
  authClient: TAuthClient,
  userId?: string,
  params?: ListOrganizationInvitationsParams<TAuthClient>
) {
  type TData = ListOrganizationInvitationsData<TAuthClient>
  const queryKey = organizationQueryKeys.invitations.list(userId, params?.query)

  return {
    queryKey,
    queryFn: userId
      ? ({ signal }) =>
          authClient.organization.listInvitations({
            ...params,
            fetchOptions: { ...params?.fetchOptions, signal, throw: true }
          }) as Promise<TData>
      : skipToken
  } satisfies QueryOptions
}

export const ensureListOrganizationInvitations = <
  TAuthClient extends OrganizationAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId?: string,
  options?: ListOrganizationInvitationsOptions<TAuthClient>
) => {
  const { fetchOptions, query, ...queryOptions } = options ?? {}

  return queryClient.ensureQueryData({
    ...listOrganizationInvitationsOptions(authClient, userId, {
      query,
      fetchOptions
    }),
    ...queryOptions
  })
}

export const prefetchListOrganizationInvitations = <
  TAuthClient extends OrganizationAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId?: string,
  options?: ListOrganizationInvitationsOptions<TAuthClient>
) => {
  const { fetchOptions, query, ...queryOptions } = options ?? {}

  return queryClient.prefetchQuery({
    ...listOrganizationInvitationsOptions(authClient, userId, {
      query,
      fetchOptions
    }),
    ...queryOptions
  })
}

export const fetchListOrganizationInvitations = <
  TAuthClient extends OrganizationAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId?: string,
  options?: ListOrganizationInvitationsOptions<TAuthClient>
) => {
  const { fetchOptions, query, ...queryOptions } = options ?? {}

  return queryClient.fetchQuery({
    ...listOrganizationInvitationsOptions(authClient, userId, {
      query,
      fetchOptions
    }),
    ...queryOptions
  })
}
export const getListOrganizationInvitations = <
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
>(
  queryClient: QueryClient,
  _authClient?: TAuthClient,
  userId?: string,
  params?: ListOrganizationInvitationsParams<TAuthClient>
) => {
  const queryKey = organizationQueryKeys.invitations.list(userId, params?.query)
  return queryClient.getQueryData<ListOrganizationInvitationsData<TAuthClient>>(
    queryKey
  )
}
