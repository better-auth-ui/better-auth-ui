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
import { useActiveOrganization } from "./active-organization-query"

export type ListOrganizationMembersData<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = InferData<TAuthClient["organization"]["listMembers"]>

export type ListOrganizationMembersParams<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Parameters<TAuthClient["organization"]["listMembers"]>[0]

export type ListOrganizationMembersOptions<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Omit<
  ReturnType<typeof listOrganizationMembersOptions<TAuthClient>>,
  "queryKey" | "queryFn"
>

export function listOrganizationMembersOptions<
  TAuthClient extends OrganizationAuthClient
>(
  authClient: TAuthClient,
  userId: string | undefined,
  params?: ListOrganizationMembersParams<TAuthClient>
) {
  type TData = ListOrganizationMembersData<TAuthClient>
  const queryKey = organizationQueryKeys.members.list(userId, params?.query)

  const options = queryOptions<TData, BetterFetchError, TData, typeof queryKey>(
    {
      queryKey,
      queryFn: ({ signal }) =>
        authClient.organization.listMembers({
          ...params,
          fetchOptions: { ...params?.fetchOptions, signal, throw: true }
        }) as Promise<TData>
    }
  )

  return options as typeof options & {
    queryKey: DataTag<typeof queryKey, TData, BetterFetchError>
  }
}

export const ensureListOrganizationMembers = <
  TAuthClient extends OrganizationAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string | undefined,
  params?: ListOrganizationMembersParams<TAuthClient>
) =>
  queryClient.ensureQueryData(
    listOrganizationMembersOptions(authClient, userId, params)
  )

export const prefetchListOrganizationMembers = <
  TAuthClient extends OrganizationAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string | undefined,
  params?: ListOrganizationMembersParams<TAuthClient>
) =>
  queryClient.prefetchQuery(
    listOrganizationMembersOptions(authClient, userId, params)
  )

export const fetchListOrganizationMembers = <
  TAuthClient extends OrganizationAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string | undefined,
  params?: ListOrganizationMembersParams<TAuthClient>
) =>
  queryClient.fetchQuery(
    listOrganizationMembersOptions(authClient, userId, params)
  )

export type UseListOrganizationMembersOptions<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = ListOrganizationMembersOptions<TAuthClient> &
  ListOrganizationMembersParams<TAuthClient>

export function useListOrganizationMembers<
  TAuthClient extends OrganizationAuthClient
>(
  authClient: TAuthClient,
  options: UseListOrganizationMembersOptions<TAuthClient> = {},
  queryClient?: QueryClient
) {
  const { data: session } = useSession(authClient, undefined, queryClient)
  const userId = session?.user.id

  const { query, fetchOptions, ...queryOptions } = options

  const { data: activeOrganization } = useActiveOrganization(
    authClient,
    { enabled: !query?.organizationId },
    queryClient
  )

  const organizationId = query?.organizationId ?? activeOrganization?.id

  const baseOptions = listOrganizationMembersOptions(authClient, userId, {
    query: {
      ...query,
      organizationId
    },
    fetchOptions
  })

  return useQuery(
    {
      ...queryOptions,
      ...baseOptions,
      queryFn: userId && organizationId ? baseOptions.queryFn : skipToken
    },
    queryClient
  )
}
