import type { DataTag, QueryClient, QueryOptions } from "@tanstack/query-core"
import type { APIError } from "better-auth"
import { apiKeyQueryKeys } from "../../../plugins/api-key"
import type { ApiKeyAuthServer } from "../../../plugins/api-key/server/api-key-auth-server"

export type ListApiKeysData<TAuth extends ApiKeyAuthServer = ApiKeyAuthServer> =
  Awaited<ReturnType<TAuth["api"]["listApiKeys"]>>

export type ListedApiKey<TAuth extends ApiKeyAuthServer = ApiKeyAuthServer> =
  NonNullable<ListApiKeysData<TAuth>>["apiKeys"][number]

export type ListApiKeysParams<
  TAuth extends ApiKeyAuthServer = ApiKeyAuthServer
> = Parameters<TAuth["api"]["listApiKeys"]>[0]

/**
 * Query options factory for the current user's API keys on the server.
 *
 * Uses the same query key as the client-side `listApiKeysOptions` so that data
 * fetched during SSR hydrates seamlessly into the client's React Query cache.
 *
 * @param auth - The Better Auth server instance with the API key plugin.
 * @param userId - The signed-in user's ID. Used for cache partitioning.
 * @param params - Parameters forwarded to `auth.api.listApiKeys`.
 */
export function listApiKeysOptions<TAuth extends ApiKeyAuthServer>(
  auth: TAuth,
  userId: string,
  params: ListApiKeysParams<TAuth>
) {
  type TData = ListApiKeysData<TAuth>
  const queryKey = apiKeyQueryKeys.list(userId, params?.query)

  const options = {
    queryKey,
    queryFn: () => auth.api.listApiKeys(params) as Promise<TData>
  } as QueryOptions<TData, APIError, TData, typeof queryKey>

  return options as typeof options & {
    queryKey: DataTag<typeof queryKey, TData, APIError>
  }
}

/**
 * Get the current user's API keys from the query cache, calling
 * `fetchListApiKeys` under the hood if no cached entry exists.
 *
 * @param queryClient - The React Query client used for SSR hydration.
 * @param auth - The Better Auth server instance with the API key plugin.
 * @param userId - The signed-in user's ID, used for cache partitioning.
 * @param params - Parameters forwarded to `auth.api.listApiKeys`.
 */
export const ensureListApiKeys = <TAuth extends ApiKeyAuthServer>(
  queryClient: QueryClient,
  auth: TAuth,
  userId: string,
  params: ListApiKeysParams<TAuth>
) => queryClient.ensureQueryData(listApiKeysOptions(auth, userId, params))

/**
 * Prefetch the current user's API keys into the query cache.
 *
 * @param queryClient - The React Query client used for SSR hydration.
 * @param auth - The Better Auth server instance with the API key plugin.
 * @param userId - The signed-in user's ID, used for cache partitioning.
 * @param params - Parameters forwarded to `auth.api.listApiKeys`.
 */
export const prefetchListApiKeys = <TAuth extends ApiKeyAuthServer>(
  queryClient: QueryClient,
  auth: TAuth,
  userId: string,
  params: ListApiKeysParams<TAuth>
) => queryClient.prefetchQuery(listApiKeysOptions(auth, userId, params))

/**
 * Fetch and cache the current user's API keys, resolving with the data or
 * throwing on error.
 *
 * @param queryClient - The React Query client used for SSR hydration.
 * @param auth - The Better Auth server instance with the API key plugin.
 * @param userId - The signed-in user's ID, used for cache partitioning.
 * @param params - Parameters forwarded to `auth.api.listApiKeys`.
 */
export const fetchListApiKeys = <TAuth extends ApiKeyAuthServer>(
  queryClient: QueryClient,
  auth: TAuth,
  userId: string,
  params: ListApiKeysParams<TAuth>
) => queryClient.fetchQuery(listApiKeysOptions(auth, userId, params))
