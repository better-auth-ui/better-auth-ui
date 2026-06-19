import { organizationQueryKeys } from "@better-auth-ui/core/plugins"
import {
  type DataTag,
  type QueryClient,
  queryOptions,
  skipToken,
  useQuery
} from "@tanstack/react-query"
import type { BetterFetchError } from "better-auth/react"
import { useSession } from "../../hooks/queries/use-session"
import type { InferData, OrganizationAuthClient } from "../../lib/auth-client"

export type FullOrganizationData<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = InferData<TAuthClient["organization"]["getFullOrganization"]>

export type FullOrganizationParams<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Parameters<TAuthClient["organization"]["getFullOrganization"]>[0]

export type FullOrganizationOptions<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Omit<
  ReturnType<typeof fullOrganizationOptions<TAuthClient>>,
  "queryKey" | "queryFn"
>

export function fullOrganizationOptions<
  TAuthClient extends OrganizationAuthClient
>(
  authClient: TAuthClient,
  userId: string | undefined,
  params?: FullOrganizationParams<TAuthClient>
) {
  type TData = FullOrganizationData<TAuthClient>
  const queryKey = organizationQueryKeys.fullDetail(userId, params?.query)

  const options = queryOptions<TData, BetterFetchError, TData, typeof queryKey>(
    {
      queryKey,
      queryFn: ({ signal }) =>
        authClient.organization.getFullOrganization({
          ...params,
          fetchOptions: { ...params?.fetchOptions, signal, throw: true }
        }) as Promise<TData>
    }
  )

  return options as typeof options & {
    queryKey: DataTag<typeof queryKey, TData, BetterFetchError>
  }
}

export const ensureFullOrganization = <
  TAuthClient extends OrganizationAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string | undefined,
  params?: FullOrganizationParams<TAuthClient>
) =>
  queryClient.ensureQueryData(
    fullOrganizationOptions(authClient, userId, params)
  )

export const prefetchFullOrganization = <
  TAuthClient extends OrganizationAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string | undefined,
  params?: FullOrganizationParams<TAuthClient>
) =>
  queryClient.prefetchQuery(fullOrganizationOptions(authClient, userId, params))

export const fetchFullOrganization = <
  TAuthClient extends OrganizationAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string | undefined,
  params?: FullOrganizationParams<TAuthClient>
) => queryClient.fetchQuery(fullOrganizationOptions(authClient, userId, params))

export type UseFullOrganizationOptions<
  TAuthClient extends OrganizationAuthClient
> = FullOrganizationOptions<TAuthClient> & FullOrganizationParams<TAuthClient>

export function useFullOrganization<TAuthClient extends OrganizationAuthClient>(
  authClient: TAuthClient,
  options: UseFullOrganizationOptions<TAuthClient> = {},
  queryClient?: QueryClient
) {
  const { data: session } = useSession(authClient, undefined, queryClient)
  const userId = session?.user.id

  const { query, fetchOptions, ...queryOptions } = options

  const baseOptions = fullOrganizationOptions(authClient, userId, {
    query,
    fetchOptions
  })

  return useQuery(
    {
      ...queryOptions,
      ...baseOptions,
      queryFn: userId ? baseOptions.queryFn : skipToken
    },
    queryClient
  )
}
