import { authQueryKeys } from "@better-auth-ui/core"
import {
  type DataTag,
  type QueryClient,
  queryOptions,
  skipToken,
  useQuery
} from "@tanstack/react-query"
import type { BetterFetchError } from "better-auth/react"
import { useSession } from "../../hooks/queries/use-session"
import type { AuthClient, InferData } from "../../lib/auth-client"

export type AccountInfoData<TAuthClient extends AuthClient> = InferData<
  TAuthClient["accountInfo"]
>

export type AccountInfoParams<TAuthClient extends AuthClient> = Parameters<
  TAuthClient["accountInfo"]
>[0]

export type AccountInfo<TAuthClient extends AuthClient = AuthClient> =
  NonNullable<AccountInfoData<TAuthClient>>

export type AccountInfoOptions<TAuthClient extends AuthClient> = Omit<
  ReturnType<typeof accountInfoOptions<TAuthClient>>,
  "queryKey" | "queryFn"
>

/**
 * Query options factory for provider-specific account info.
 *
 * @param authClient - The Better Auth client.
 * @param userId - The current signed-in user's ID. Used for cache partitioning.
 * @param params - Parameters forwarded to `authClient.accountInfo`.
 */
export function accountInfoOptions<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  userId: string | undefined,
  params?: AccountInfoParams<TAuthClient>
) {
  type TData = AccountInfoData<TAuthClient>
  const queryKey = authQueryKeys.accountInfo(userId, params?.query)

  const options = queryOptions<TData, BetterFetchError, TData, typeof queryKey>(
    {
      queryKey,
      queryFn: ({ signal }) =>
        authClient.accountInfo({
          ...params,
          fetchOptions: { ...params?.fetchOptions, signal, throw: true }
        }) as Promise<TData>
    }
  )

  return options as typeof options & {
    queryKey: DataTag<typeof queryKey, TData, BetterFetchError>
  }
}

/**
 * Get the current user's provider-specific account info from the query
 * cache, calling `fetchAccountInfo` under the hood if no cached entry
 * exists. Resolves with the data, making it ideal for loaders or
 * `beforeLoad` guards.
 *
 * @param queryClient - The React Query client.
 * @param authClient - The Better Auth client.
 * @param userId - The signed-in user's ID, used for cache partitioning.
 * @param params - Parameters forwarded to `authClient.accountInfo`.
 */
export const ensureAccountInfo = <TAuthClient extends AuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string,
  params?: AccountInfoParams<TAuthClient>
) => queryClient.ensureQueryData(accountInfoOptions(authClient, userId, params))

/**
 * Prefetch the current user's provider-specific account info into the query
 * cache. Behaves like `fetchAccountInfo`, but does not throw on error and
 * does not return the data — use this to warm the cache without blocking
 * navigation.
 *
 * @param queryClient - The React Query client.
 * @param authClient - The Better Auth client.
 * @param userId - The signed-in user's ID, used for cache partitioning.
 * @param params - Parameters forwarded to `authClient.accountInfo`.
 */
export const prefetchAccountInfo = <TAuthClient extends AuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string,
  params?: AccountInfoParams<TAuthClient>
) => queryClient.prefetchQuery(accountInfoOptions(authClient, userId, params))

/**
 * Fetch and cache the current user's provider-specific account info,
 * resolving with the data or throwing on error. If a cached entry exists
 * and is neither invalidated nor older than `staleTime`, the cached value
 * is returned without a network call; otherwise the latest data is fetched.
 *
 * @param queryClient - The React Query client.
 * @param authClient - The Better Auth client.
 * @param userId - The signed-in user's ID, used for cache partitioning.
 * @param params - Parameters forwarded to `authClient.accountInfo`.
 */
export const fetchAccountInfo = <TAuthClient extends AuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string,
  params?: AccountInfoParams<TAuthClient>
) => queryClient.fetchQuery(accountInfoOptions(authClient, userId, params))

export type UseAccountInfoOptions<TAuthClient extends AuthClient> =
  AccountInfoOptions<TAuthClient> & AccountInfoParams<TAuthClient>

/**
 * Subscribe to provider-specific info for a linked account via TanStack Query.
 *
 * Shares a query key with the server-side `accountInfoOptions`, so
 * SSR-hydrated data is reused from the cache without an immediate refetch.
 * The query is gated on both a signed-in user and a resolved `accountId`;
 * until both are present, the underlying `queryFn` is replaced with
 * `skipToken`.
 *
 * @param authClient - The Better Auth client.
 * @param options - `accountInfo` params (`query`, `fetchOptions`) merged
 *   with `useQuery` options (e.g. `enabled`, `staleTime`, `select`).
 * @param queryClient - Optional custom `QueryClient`. Defaults to the client
 *   from the nearest `QueryClientProvider`.
 */
export function useAccountInfo<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options: UseAccountInfoOptions<TAuthClient> = {},
  queryClient?: QueryClient
) {
  const { data: session } = useSession(authClient, undefined, queryClient)
  const userId = session?.user.id

  const { query, fetchOptions, ...queryOptions } = options

  const baseOptions = accountInfoOptions(authClient, userId, {
    query,
    fetchOptions
  })

  const canFetch = Boolean(userId && query?.accountId)

  return useQuery(
    {
      ...queryOptions,
      ...baseOptions,
      queryFn: canFetch ? baseOptions.queryFn : skipToken
    },
    queryClient
  )
}
