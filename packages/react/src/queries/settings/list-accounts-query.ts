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

export type ListAccountsData<TAuthClient extends AuthClient> = InferData<
  TAuthClient["listAccounts"]
>

export type ListAccountsParams<TAuthClient extends AuthClient> = Parameters<
  TAuthClient["listAccounts"]
>[0]

export type ListAccount<TAuthClient extends AuthClient = AuthClient> =
  NonNullable<ListAccountsData<TAuthClient>>[number]

export type ListAccountsOptions<TAuthClient extends AuthClient> = Omit<
  ReturnType<typeof listAccountsOptions<TAuthClient>>,
  "queryKey" | "queryFn"
>

/**
 * Query options factory for a user's linked social accounts.
 *
 * @param authClient - The Better Auth client.
 * @param userId - The current signed-in user's ID. Used for cache partitioning.
 * @param params - Parameters forwarded to `authClient.listAccounts`.
 */
export function listAccountsOptions<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  userId: string | undefined,
  params?: ListAccountsParams<TAuthClient>
) {
  type TData = ListAccountsData<TAuthClient>
  const queryKey = authQueryKeys.listAccounts(userId, params?.query)

  const options = queryOptions<TData, BetterFetchError, TData, typeof queryKey>(
    {
      queryKey,
      queryFn: ({ signal }) =>
        authClient.listAccounts({
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
 * Get the current user's linked social accounts from the query cache,
 * calling `fetchListAccounts` under the hood if no cached entry exists.
 * Resolves with the account list, making it ideal for loaders or
 * `beforeLoad` guards.
 *
 * @param queryClient - The React Query client.
 * @param authClient - The Better Auth client.
 * @param userId - The signed-in user's ID, used for cache partitioning.
 * @param params - Parameters forwarded to `authClient.listAccounts`.
 */
export const ensureListAccounts = <TAuthClient extends AuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string,
  params?: ListAccountsParams<TAuthClient>
) =>
  queryClient.ensureQueryData(listAccountsOptions(authClient, userId, params))

/**
 * Prefetch the current user's linked social accounts into the query cache.
 * Behaves like `fetchListAccounts`, but does not throw on error and does
 * not return the data — use this to warm the cache without blocking
 * navigation.
 *
 * @param queryClient - The React Query client.
 * @param authClient - The Better Auth client.
 * @param userId - The signed-in user's ID, used for cache partitioning.
 * @param params - Parameters forwarded to `authClient.listAccounts`.
 */
export const prefetchListAccounts = <TAuthClient extends AuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string,
  params?: ListAccountsParams<TAuthClient>
) => queryClient.prefetchQuery(listAccountsOptions(authClient, userId, params))

/**
 * Fetch and cache the current user's linked social accounts, resolving
 * with the data or throwing on error. If a cached entry exists and is
 * neither invalidated nor older than `staleTime`, the cached value is
 * returned without a network call; otherwise the latest data is fetched.
 *
 * @param queryClient - The React Query client.
 * @param authClient - The Better Auth client.
 * @param userId - The signed-in user's ID, used for cache partitioning.
 * @param params - Parameters forwarded to `authClient.listAccounts`.
 */
export const fetchListAccounts = <TAuthClient extends AuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string,
  params?: ListAccountsParams<TAuthClient>
) => queryClient.fetchQuery(listAccountsOptions(authClient, userId, params))

export type UseListAccountsOptions<TAuthClient extends AuthClient> =
  ListAccountsOptions<TAuthClient> & ListAccountsParams<TAuthClient>

/**
 * Subscribe to the current user's linked social accounts via TanStack Query.
 *
 * Shares a query key with the server-side `listAccountsOptions`, so
 * SSR-hydrated data is reused from the cache without an immediate refetch.
 * The query is gated on a signed-in user; while the session is loading or
 * absent, the underlying `queryFn` is replaced with `skipToken`.
 *
 * @param authClient - The Better Auth client.
 * @param options - `listAccounts` params (`query`, `fetchOptions`) merged
 *   with `useQuery` options (e.g. `enabled`, `staleTime`, `select`).
 * @param queryClient - Optional custom `QueryClient`. Defaults to the client
 *   from the nearest `QueryClientProvider`.
 */
export function useListAccounts<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options: UseListAccountsOptions<TAuthClient> = {},
  queryClient?: QueryClient
) {
  const { data: session } = useSession(authClient, undefined, queryClient)
  const userId = session?.user.id

  const { query, fetchOptions, ...queryOptions } = options

  const baseOptions = listAccountsOptions(authClient, userId, {
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
