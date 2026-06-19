import { apiKeyQueryKeys } from "@better-auth-ui/core/plugins"
import {
  type DataTag,
  type QueryClient,
  queryOptions,
  skipToken,
  useQuery
} from "@tanstack/react-query"
import type { BetterFetchError } from "better-auth/react"
import { useSession } from "../../hooks/queries/use-session"
import type { ApiKeyAuthClient, InferData } from "../../lib/auth-client"

export type ListApiKeysData<
  TAuthClient extends ApiKeyAuthClient = ApiKeyAuthClient
> = InferData<TAuthClient["apiKey"]["list"]>

export type ListApiKeysParams<
  TAuthClient extends ApiKeyAuthClient = ApiKeyAuthClient
> = Parameters<TAuthClient["apiKey"]["list"]>[0]

export type ListedApiKey<
  TAuthClient extends ApiKeyAuthClient = ApiKeyAuthClient
> = NonNullable<ListApiKeysData<TAuthClient>>["apiKeys"][number]

export type ListApiKeysOptions<
  TAuthClient extends ApiKeyAuthClient = ApiKeyAuthClient
> = Omit<
  ReturnType<typeof listApiKeysOptions<TAuthClient>>,
  "queryKey" | "queryFn"
>

/**
 * Query options factory for the current user's API keys.
 *
 * Shares a query key with the server-side `listApiKeysOptions` from
 * `@better-auth-ui/react/server`, so SSR-hydrated data is reused from the
 * cache without an immediate refetch.
 *
 * @param authClient - The Better Auth client with the API key plugin.
 * @param userId - The current signed-in user's ID. Used for cache partitioning.
 * @param params - Parameters forwarded to `authClient.apiKey.list`.
 */
export function listApiKeysOptions<TAuthClient extends ApiKeyAuthClient>(
  authClient: TAuthClient,
  userId: string | undefined,
  params?: ListApiKeysParams<TAuthClient>
) {
  type TData = ListApiKeysData<TAuthClient>
  const queryKey = apiKeyQueryKeys.list(userId, params?.query)

  const options = queryOptions<TData, BetterFetchError, TData, typeof queryKey>(
    {
      queryKey,
      queryFn: ({ signal }) =>
        authClient.apiKey.list({
          ...params,
          fetchOptions: { ...params?.fetchOptions, signal, throw: true }
        }) as Promise<TData>
    }
  )

  return options as typeof options & {
    queryKey: DataTag<typeof queryKey, TData, BetterFetchError>
  }
}

export const ensureListApiKeys = <TAuthClient extends ApiKeyAuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string,
  params?: ListApiKeysParams<TAuthClient>
) => queryClient.ensureQueryData(listApiKeysOptions(authClient, userId, params))

export const prefetchListApiKeys = <TAuthClient extends ApiKeyAuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string,
  params?: ListApiKeysParams<TAuthClient>
) => queryClient.prefetchQuery(listApiKeysOptions(authClient, userId, params))

export const fetchListApiKeys = <TAuthClient extends ApiKeyAuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string,
  params?: ListApiKeysParams<TAuthClient>
) => queryClient.fetchQuery(listApiKeysOptions(authClient, userId, params))

export type UseListApiKeysOptions<TAuthClient extends ApiKeyAuthClient> =
  ListApiKeysOptions<TAuthClient> & ListApiKeysParams<TAuthClient>

/**
 * Subscribe to the current user's API keys via TanStack Query.
 *
 * Shares a query key with the server-side `listApiKeysOptions`, so
 * SSR-hydrated data is reused from the cache without an immediate refetch.
 * The query is gated on a signed-in user; while the session is loading or
 * absent, the underlying `queryFn` is replaced with `skipToken`.
 *
 * @param authClient - The Better Auth client with the API key plugin.
 * @param options - `apiKey.list` params merged with `useQuery` options.
 * @param queryClient - Optional custom `QueryClient`.
 */
export function useListApiKeys<TAuthClient extends ApiKeyAuthClient>(
  authClient: TAuthClient,
  options: UseListApiKeysOptions<TAuthClient> = {},
  queryClient?: QueryClient
) {
  const { data: session } = useSession(authClient, undefined, queryClient)
  const userId = session?.user.id

  const { query, fetchOptions, ...queryOptionsRest } = options

  const baseOptions = listApiKeysOptions(authClient, userId, {
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
