import {
  type QueryClient,
  type QueryOptions,
  skipToken
} from "@tanstack/query-core"
import type { InferData } from "../../lib/auth-client"
import type { OrganizationAuthClient } from "./organization-auth-client"
import { organizationQueryKeys } from "./organization-query-keys"

export type ListOrganizationsData<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = InferData<TAuthClient["organization"]["list"]>

export type ListOrganization<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = NonNullable<ListOrganizationsData<TAuthClient>>[number]

export type ListOrganizationsParams<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Parameters<TAuthClient["organization"]["list"]>[0]

export type ListOrganizationsOptions<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Omit<QueryOptions<ListOrganizationsData<TAuthClient>>, "queryKey"> &
  ListOrganizationsParams<TAuthClient>

export function listOrganizationsOptions<
  TAuthClient extends OrganizationAuthClient
>(
  authClient: TAuthClient,
  userId?: string,
  params?: ListOrganizationsParams<TAuthClient>
) {
  type TData = ListOrganizationsData<TAuthClient>
  const queryKey = organizationQueryKeys.list(userId, params?.query)

  return {
    queryKey,
    queryFn: userId
      ? ({ signal }) =>
          authClient.organization.list({
            ...params,
            fetchOptions: { ...params?.fetchOptions, signal, throw: true }
          }) as Promise<TData>
      : skipToken
  } satisfies QueryOptions
}

export const ensureListOrganizations = <
  TAuthClient extends OrganizationAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId?: string,
  options?: ListOrganizationsOptions<TAuthClient>
) => {
  const { fetchOptions, query, ...queryOptions } = options ?? {}

  return queryClient.ensureQueryData({
    ...listOrganizationsOptions(authClient, userId, { query, fetchOptions }),
    ...queryOptions
  })
}

export const prefetchListOrganizations = <
  TAuthClient extends OrganizationAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId?: string,
  options?: ListOrganizationsOptions<TAuthClient>
) => {
  const { fetchOptions, query, ...queryOptions } = options ?? {}

  return queryClient.prefetchQuery({
    ...listOrganizationsOptions(authClient, userId, { query, fetchOptions }),
    ...queryOptions
  })
}

export const fetchListOrganizations = <
  TAuthClient extends OrganizationAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId?: string,
  options?: ListOrganizationsOptions<TAuthClient>
) => {
  const { fetchOptions, query, ...queryOptions } = options ?? {}

  return queryClient.fetchQuery({
    ...listOrganizationsOptions(authClient, userId, { query, fetchOptions }),
    ...queryOptions
  })
}
export const getListOrganizations = <
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
>(
  queryClient: QueryClient,
  _authClient?: TAuthClient,
  userId?: string,
  params?: ListOrganizationsParams<TAuthClient>
) => {
  const queryKey = organizationQueryKeys.list(userId, params?.query)
  return queryClient.getQueryData<ListOrganizationsData<TAuthClient>>(queryKey)
}
