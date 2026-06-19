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

export type ListOrganizationInvitationsData<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = InferData<TAuthClient["organization"]["listInvitations"]>

export type ListOrganizationInvitationsParams<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Parameters<TAuthClient["organization"]["listInvitations"]>[0]

export type ListOrganizationInvitationsOptions<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Omit<
  ReturnType<typeof listOrganizationInvitationsOptions<TAuthClient>>,
  "queryKey" | "queryFn"
>

export function listOrganizationInvitationsOptions<
  TAuthClient extends OrganizationAuthClient
>(
  authClient: TAuthClient,
  userId: string | undefined,
  params?: ListOrganizationInvitationsParams<TAuthClient>
) {
  type TData = ListOrganizationInvitationsData<TAuthClient>
  const queryKey = organizationQueryKeys.invitations.list(userId, params?.query)

  const options = queryOptions<TData, BetterFetchError, TData, typeof queryKey>(
    {
      queryKey,
      queryFn: ({ signal }) =>
        authClient.organization.listInvitations({
          ...params,
          fetchOptions: { ...params?.fetchOptions, signal, throw: true }
        }) as Promise<TData>
    }
  )

  return options as typeof options & {
    queryKey: DataTag<typeof queryKey, TData, BetterFetchError>
  }
}

export const ensureListOrganizationInvitations = <
  TAuthClient extends OrganizationAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string | undefined,
  params?: ListOrganizationInvitationsParams<TAuthClient>
) =>
  queryClient.ensureQueryData(
    listOrganizationInvitationsOptions(authClient, userId, params)
  )

export const prefetchListOrganizationInvitations = <
  TAuthClient extends OrganizationAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string | undefined,
  params?: ListOrganizationInvitationsParams<TAuthClient>
) =>
  queryClient.prefetchQuery(
    listOrganizationInvitationsOptions(authClient, userId, params)
  )

export const fetchListOrganizationInvitations = <
  TAuthClient extends OrganizationAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string | undefined,
  params?: ListOrganizationInvitationsParams<TAuthClient>
) =>
  queryClient.fetchQuery(
    listOrganizationInvitationsOptions(authClient, userId, params)
  )

export type UseListOrganizationInvitationsOptions<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = ListOrganizationInvitationsOptions<TAuthClient> &
  ListOrganizationInvitationsParams<TAuthClient>

export function useListOrganizationInvitations<
  TAuthClient extends OrganizationAuthClient
>(
  authClient: TAuthClient,
  options: UseListOrganizationInvitationsOptions<TAuthClient> = {},
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

  const baseOptions = listOrganizationInvitationsOptions(authClient, userId, {
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
