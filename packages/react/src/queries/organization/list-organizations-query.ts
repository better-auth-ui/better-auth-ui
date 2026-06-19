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
> = Omit<
  ReturnType<typeof listOrganizationsOptions<TAuthClient>>,
  "queryKey" | "queryFn"
>

export function listOrganizationsOptions<
  TAuthClient extends OrganizationAuthClient
>(
  authClient: TAuthClient,
  userId: string | undefined,
  params?: ListOrganizationsParams<TAuthClient>
) {
  type TData = ListOrganizationsData<TAuthClient>
  const queryKey = organizationQueryKeys.list(userId, params?.query)

  const options = queryOptions<TData, BetterFetchError, TData, typeof queryKey>(
    {
      queryKey,
      queryFn: ({ signal }) =>
        authClient.organization.list({
          ...params,
          fetchOptions: { ...params?.fetchOptions, signal, throw: true }
        }) as Promise<TData>
    }
  )

  return options as typeof options & {
    queryKey: DataTag<typeof queryKey, TData, BetterFetchError>
  }
}

export const ensureListOrganizations = <
  TAuthClient extends OrganizationAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string,
  params?: ListOrganizationsParams<TAuthClient>
) =>
  queryClient.ensureQueryData(
    listOrganizationsOptions(authClient, userId, params)
  )

export const prefetchListOrganizations = <
  TAuthClient extends OrganizationAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string,
  params?: ListOrganizationsParams<TAuthClient>
) =>
  queryClient.prefetchQuery(
    listOrganizationsOptions(authClient, userId, params)
  )

export const fetchListOrganizations = <
  TAuthClient extends OrganizationAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string,
  params?: ListOrganizationsParams<TAuthClient>
) =>
  queryClient.fetchQuery(listOrganizationsOptions(authClient, userId, params))

export type UseListOrganizationsOptions<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = ListOrganizationsOptions<TAuthClient> & ListOrganizationsParams<TAuthClient>

export function useListOrganizations<
  TAuthClient extends OrganizationAuthClient
>(
  authClient: TAuthClient,
  options: UseListOrganizationsOptions<TAuthClient> = {},
  queryClient?: QueryClient
) {
  const { data: session } = useSession(authClient, undefined, queryClient)
  const userId = session?.user.id

  const { query, fetchOptions, ...queryOptionsRest } = options

  const baseOptions = listOrganizationsOptions(authClient, userId, {
    query,
    fetchOptions
  })

  return useQuery(
    {
      ...queryOptionsRest,
      ...baseOptions,
      queryFn: userId ? baseOptions.queryFn : skipToken
    },
    queryClient
  )
}
