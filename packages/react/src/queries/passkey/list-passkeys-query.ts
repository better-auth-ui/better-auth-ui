import { passkeyQueryKeys } from "@better-auth-ui/core/plugins"
import {
  type DataTag,
  type QueryClient,
  queryOptions,
  skipToken,
  useQuery
} from "@tanstack/react-query"
import type { BetterFetchError } from "better-auth/react"
import { useSession } from "../../hooks/queries/use-session"
import type { InferData, PasskeyAuthClient } from "../../lib/auth-client"

export type ListPasskeysData<TAuthClient extends PasskeyAuthClient> = InferData<
  TAuthClient["passkey"]["listUserPasskeys"]
>

export type ListPasskeysParams<TAuthClient extends PasskeyAuthClient> =
  Parameters<TAuthClient["passkey"]["listUserPasskeys"]>[0]

export type ListPasskey<
  TAuthClient extends PasskeyAuthClient = PasskeyAuthClient
> = NonNullable<ListPasskeysData<TAuthClient>>[number]

export type ListPasskeysOptions<TAuthClient extends PasskeyAuthClient> = Omit<
  ReturnType<typeof listPasskeysOptions<TAuthClient>>,
  "queryKey" | "queryFn"
>

/**
 * Query options factory for the current user's passkeys.
 *
 * @param authClient - The Better Auth client with the passkey plugin.
 * @param userId - The current signed-in user's ID. Used for cache partitioning.
 * @param params - Parameters forwarded to `authClient.passkey.listUserPasskeys`.
 */
export function listPasskeysOptions<TAuthClient extends PasskeyAuthClient>(
  authClient: TAuthClient,
  userId: string | undefined,
  params?: ListPasskeysParams<TAuthClient>
) {
  type TData = ListPasskeysData<TAuthClient>
  const queryKey = passkeyQueryKeys.list(userId, params?.query)

  const options = queryOptions<TData, BetterFetchError, TData, typeof queryKey>(
    {
      queryKey,
      queryFn: ({ signal }) =>
        authClient.passkey.listUserPasskeys({
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
 * Get the current user's passkeys from the query cache, calling
 * `fetchListPasskeys` under the hood if no cached entry exists. Resolves
 * with the passkey list, making it ideal for loaders or `beforeLoad` guards.
 *
 * @param queryClient - The React Query client.
 * @param authClient - The Better Auth client with the passkey plugin.
 * @param userId - The signed-in user's ID, used for cache partitioning.
 * @param params - Parameters forwarded to `authClient.passkey.listUserPasskeys`.
 */
export const ensureListPasskeys = <TAuthClient extends PasskeyAuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string,
  params?: ListPasskeysParams<TAuthClient>
) =>
  queryClient.ensureQueryData(listPasskeysOptions(authClient, userId, params))

/**
 * Prefetch the current user's passkeys into the query cache. Behaves like
 * `fetchListPasskeys`, but does not throw on error and does not return
 * the data — use this to warm the cache without blocking navigation.
 *
 * @param queryClient - The React Query client.
 * @param authClient - The Better Auth client with the passkey plugin.
 * @param userId - The signed-in user's ID, used for cache partitioning.
 * @param params - Parameters forwarded to `authClient.passkey.listUserPasskeys`.
 */
export const prefetchListPasskeys = <TAuthClient extends PasskeyAuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string,
  params?: ListPasskeysParams<TAuthClient>
) => queryClient.prefetchQuery(listPasskeysOptions(authClient, userId, params))

/**
 * Fetch and cache the current user's passkeys, resolving with the data or
 * throwing on error. If a cached entry exists and is neither invalidated
 * nor older than `staleTime`, the cached value is returned without a
 * network call; otherwise the latest data is fetched.
 *
 * @param queryClient - The React Query client.
 * @param authClient - The Better Auth client with the passkey plugin.
 * @param userId - The signed-in user's ID, used for cache partitioning.
 * @param params - Parameters forwarded to `authClient.passkey.listUserPasskeys`.
 */
export const fetchListPasskeys = <TAuthClient extends PasskeyAuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string,
  params?: ListPasskeysParams<TAuthClient>
) => queryClient.fetchQuery(listPasskeysOptions(authClient, userId, params))

export type UseListPasskeysOptions<TAuthClient extends PasskeyAuthClient> =
  ListPasskeysOptions<TAuthClient> & ListPasskeysParams<TAuthClient>

/**
 * Subscribe to the current user's passkeys via TanStack Query.
 *
 * Shares a query key with the server-side `listPasskeysOptions`, so
 * SSR-hydrated data is reused from the cache without an immediate refetch.
 * The query is gated on a signed-in user; while the session is loading or
 * absent, the underlying `queryFn` is replaced with `skipToken`.
 *
 * @param authClient - The Better Auth client with the passkey plugin.
 * @param options - `listPasskeys` params (`query`, `fetchOptions`) merged
 *   with `useQuery` options (e.g. `enabled`, `staleTime`, `select`).
 * @param queryClient - Optional custom `QueryClient`. Defaults to the client
 *   from the nearest `QueryClientProvider`.
 */
export function useListPasskeys<TAuthClient extends PasskeyAuthClient>(
  authClient: TAuthClient,
  options: UseListPasskeysOptions<TAuthClient> = {},
  queryClient?: QueryClient
) {
  const { data: session } = useSession(authClient, undefined, queryClient)
  const userId = session?.user.id

  const { query, fetchOptions, ...queryOptions } = options

  const baseOptions = listPasskeysOptions(authClient, userId, {
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
