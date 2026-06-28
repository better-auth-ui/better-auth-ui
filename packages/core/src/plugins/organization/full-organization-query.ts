import {
  type QueryClient,
  type QueryOptions,
  skipToken
} from "@tanstack/query-core"
import type { InferData } from "../../lib/auth-client"
import type { OrganizationAuthClient } from "./organization-auth-client"
import { organizationQueryKeys } from "./organization-query-keys"

export type FullOrganizationData<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = InferData<TAuthClient["organization"]["getFullOrganization"]>

export type FullOrganizationParams<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Parameters<TAuthClient["organization"]["getFullOrganization"]>[0]

export type FullOrganizationOptions<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Omit<QueryOptions<FullOrganizationData<TAuthClient>>, "queryKey"> &
  FullOrganizationParams<TAuthClient>

export function fullOrganizationOptions<
  TAuthClient extends OrganizationAuthClient
>(
  authClient: TAuthClient,
  userId?: string,
  params?: FullOrganizationParams<TAuthClient>
) {
  type TData = FullOrganizationData<TAuthClient>
  const queryKey = organizationQueryKeys.fullDetail(userId, params?.query)

  return {
    queryKey,
    queryFn: userId
      ? ({ signal }) =>
          authClient.organization.getFullOrganization({
            ...params,
            fetchOptions: { ...params?.fetchOptions, signal, throw: true }
          }) as Promise<TData>
      : skipToken
  } satisfies QueryOptions
}

export const ensureFullOrganization = <
  TAuthClient extends OrganizationAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId?: string,
  options?: FullOrganizationOptions<TAuthClient>
) => {
  const { fetchOptions, query, ...queryOptions } = options ?? {}

  return queryClient.ensureQueryData({
    ...fullOrganizationOptions(authClient, userId, { query, fetchOptions }),
    ...queryOptions
  })
}

export const prefetchFullOrganization = <
  TAuthClient extends OrganizationAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId?: string,
  options?: FullOrganizationOptions<TAuthClient>
) => {
  const { fetchOptions, query, ...queryOptions } = options ?? {}

  return queryClient.prefetchQuery({
    ...fullOrganizationOptions(authClient, userId, { query, fetchOptions }),
    ...queryOptions
  })
}

export const fetchFullOrganization = <
  TAuthClient extends OrganizationAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId?: string,
  options?: FullOrganizationOptions<TAuthClient>
) => {
  const { fetchOptions, query, ...queryOptions } = options ?? {}

  return queryClient.fetchQuery({
    ...fullOrganizationOptions(authClient, userId, { query, fetchOptions }),
    ...queryOptions
  })
}
