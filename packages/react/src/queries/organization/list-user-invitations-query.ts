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

export type ListUserInvitationsData<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = InferData<TAuthClient["organization"]["listUserInvitations"]>

export type ListUserInvitationsParams<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Parameters<TAuthClient["organization"]["listUserInvitations"]>[0]

export type ListUserInvitationsOptions<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Omit<
  ReturnType<typeof listUserInvitationsOptions<TAuthClient>>,
  "queryKey" | "queryFn"
>

export function listUserInvitationsOptions<
  TAuthClient extends OrganizationAuthClient
>(
  authClient: TAuthClient,
  userId: string | undefined,
  params?: ListUserInvitationsParams<TAuthClient>
) {
  type TData = ListUserInvitationsData<TAuthClient>
  const queryKey = organizationQueryKeys.userInvitations.list(
    userId,
    params?.query
  )

  const options = queryOptions<TData, BetterFetchError, TData, typeof queryKey>(
    {
      queryKey,
      queryFn: ({ signal }) =>
        authClient.organization.listUserInvitations({
          ...params,
          fetchOptions: { ...params?.fetchOptions, signal, throw: true }
        }) as Promise<TData>
    }
  )

  return options as typeof options & {
    queryKey: DataTag<typeof queryKey, TData, BetterFetchError>
  }
}

export const ensureListUserInvitations = <
  TAuthClient extends OrganizationAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string | undefined,
  params?: ListUserInvitationsParams<TAuthClient>
) =>
  queryClient.ensureQueryData(
    listUserInvitationsOptions(authClient, userId, params)
  )

export const prefetchListUserInvitations = <
  TAuthClient extends OrganizationAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string | undefined,
  params?: ListUserInvitationsParams<TAuthClient>
) =>
  queryClient.prefetchQuery(
    listUserInvitationsOptions(authClient, userId, params)
  )

export const fetchListUserInvitations = <
  TAuthClient extends OrganizationAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string | undefined,
  params?: ListUserInvitationsParams<TAuthClient>
) =>
  queryClient.fetchQuery(listUserInvitationsOptions(authClient, userId, params))

export type UseListUserInvitationsOptions<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = ListUserInvitationsOptions<TAuthClient> &
  ListUserInvitationsParams<TAuthClient>

export function useListUserInvitations<
  TAuthClient extends OrganizationAuthClient
>(
  authClient: TAuthClient,
  options: UseListUserInvitationsOptions<TAuthClient> = {},
  queryClient?: QueryClient
) {
  const { data: session } = useSession(authClient, undefined, queryClient)
  const userId = session?.user.id

  const { query, fetchOptions, ...queryOptions } = options

  const baseOptions = listUserInvitationsOptions(authClient, userId, {
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
