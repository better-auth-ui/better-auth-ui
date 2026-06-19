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

export type HasPermissionData<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = InferData<TAuthClient["organization"]["hasPermission"]>

export type HasPermissionParams<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Parameters<TAuthClient["organization"]["hasPermission"]>[0]

export type HasPermissionOptions<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Omit<
  ReturnType<typeof hasPermissionOptions<TAuthClient>>,
  "queryKey" | "queryFn"
>

export function hasPermissionOptions<
  TAuthClient extends OrganizationAuthClient
>(
  authClient: TAuthClient,
  userId: string | undefined,
  params: HasPermissionParams<TAuthClient>
) {
  type TData = HasPermissionData<TAuthClient>
  // `hasPermission` is the only org client method without a `query` field — its
  // params are flat — so the "query" portion is everything except `fetchOptions`.
  const { fetchOptions, ...query } = params
  const queryKey = organizationQueryKeys.permissions.has(userId, query)

  const options = queryOptions<TData, BetterFetchError, TData, typeof queryKey>(
    {
      queryKey,
      queryFn: ({ signal }) =>
        authClient.organization.hasPermission({
          ...query,
          fetchOptions: { ...fetchOptions, signal, throw: true }
        }) as Promise<TData>
    }
  )

  return options as typeof options & {
    queryKey: DataTag<typeof queryKey, TData, BetterFetchError>
  }
}

export const ensureHasPermission = <TAuthClient extends OrganizationAuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string | undefined,
  params: HasPermissionParams<TAuthClient>
) =>
  queryClient.ensureQueryData(hasPermissionOptions(authClient, userId, params))

export const prefetchHasPermission = <
  TAuthClient extends OrganizationAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string | undefined,
  params: HasPermissionParams<TAuthClient>
) => queryClient.prefetchQuery(hasPermissionOptions(authClient, userId, params))

export const fetchHasPermission = <TAuthClient extends OrganizationAuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string | undefined,
  params: HasPermissionParams<TAuthClient>
) => queryClient.fetchQuery(hasPermissionOptions(authClient, userId, params))

export type UseHasPermissionOptions<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = HasPermissionOptions<TAuthClient> & HasPermissionParams<TAuthClient>

export function useHasPermission<TAuthClient extends OrganizationAuthClient>(
  authClient: TAuthClient,
  options: UseHasPermissionOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  const { data: session } = useSession(authClient, undefined, queryClient)
  const userId = session?.user.id

  const {
    fetchOptions,
    permissions,
    organizationId: optionsOrganizationId,
    ...queryOptions
  } = options

  const { data: activeOrganization } = useActiveOrganization(
    authClient,
    { enabled: !optionsOrganizationId },
    queryClient
  )

  const organizationId = optionsOrganizationId ?? activeOrganization?.id

  const baseOptions = hasPermissionOptions(authClient, userId, {
    fetchOptions,
    organizationId,
    permissions
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
