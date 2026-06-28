import {
  type QueryClient,
  type QueryOptions,
  skipToken
} from "@tanstack/query-core"
import type { InferData } from "../../lib/auth-client"
import type { OrganizationAuthClient } from "./organization-auth-client"
import { organizationQueryKeys } from "./organization-query-keys"

export type ListOrganizationMembersData<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = InferData<TAuthClient["organization"]["listMembers"]>

export type ListOrganizationMembersParams<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Parameters<TAuthClient["organization"]["listMembers"]>[0]

export type ListOrganizationMembersOptions<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Omit<QueryOptions<ListOrganizationMembersData<TAuthClient>>, "queryKey"> &
  ListOrganizationMembersParams<TAuthClient>

export function listOrganizationMembersOptions<
  TAuthClient extends OrganizationAuthClient
>(
  authClient: TAuthClient,
  userId?: string,
  params?: ListOrganizationMembersParams<TAuthClient>
) {
  type TData = ListOrganizationMembersData<TAuthClient>
  const queryKey = organizationQueryKeys.members.list(userId, params?.query)

  return {
    queryKey,
    queryFn: userId
      ? ({ signal }) =>
          authClient.organization.listMembers({
            ...params,
            fetchOptions: { ...params?.fetchOptions, signal, throw: true }
          }) as Promise<TData>
      : skipToken
  } satisfies QueryOptions
}

export const ensureListOrganizationMembers = <
  TAuthClient extends OrganizationAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId?: string,
  options?: ListOrganizationMembersOptions<TAuthClient>
) => {
  const { fetchOptions, query, ...queryOptions } = options ?? {}

  return queryClient.ensureQueryData({
    ...listOrganizationMembersOptions(authClient, userId, {
      query,
      fetchOptions
    }),
    ...queryOptions
  })
}

export const prefetchListOrganizationMembers = <
  TAuthClient extends OrganizationAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId?: string,
  options?: ListOrganizationMembersOptions<TAuthClient>
) => {
  const { fetchOptions, query, ...queryOptions } = options ?? {}

  return queryClient.prefetchQuery({
    ...listOrganizationMembersOptions(authClient, userId, {
      query,
      fetchOptions
    }),
    ...queryOptions
  })
}

export const fetchListOrganizationMembers = <
  TAuthClient extends OrganizationAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId?: string,
  options?: ListOrganizationMembersOptions<TAuthClient>
) => {
  const { fetchOptions, query, ...queryOptions } = options ?? {}

  return queryClient.fetchQuery({
    ...listOrganizationMembersOptions(authClient, userId, {
      query,
      fetchOptions
    }),
    ...queryOptions
  })
}
export const getListOrganizationMembers = <
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
>(
  queryClient: QueryClient,
  _authClient?: TAuthClient,
  userId?: string,
  params?: ListOrganizationMembersParams<TAuthClient>
) => {
  const queryKey = organizationQueryKeys.members.list(userId, params?.query)
  return queryClient.getQueryData<ListOrganizationMembersData<TAuthClient>>(
    queryKey
  )
}
