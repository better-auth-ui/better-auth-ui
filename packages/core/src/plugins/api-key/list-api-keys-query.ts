import {
  type QueryClient,
  type QueryOptions,
  skipToken
} from "@tanstack/query-core"
import type { InferData } from "../../lib/auth-client"
import type { ApiKeyAuthClient } from "./api-key-auth-client"
import { apiKeyQueryKeys } from "./api-key-query-keys"

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
> = Omit<QueryOptions<ListApiKeysData<TAuthClient>>, "queryKey"> &
  ListApiKeysParams<TAuthClient>

/**
 * Query options factory for the current user's API keys.
 *
 * @param authClient - The Better Auth API key client.
 * @param userId - The current signed-in user's ID. Used for cache partitioning.
 * @param params - Parameters forwarded to `authClient.apiKey.list`.
 */
export function listApiKeysOptions<TAuthClient extends ApiKeyAuthClient>(
  authClient: TAuthClient,
  userId?: string,
  params?: ListApiKeysParams<TAuthClient>
) {
  type TData = ListApiKeysData<TAuthClient>
  const queryKey = apiKeyQueryKeys.list(userId, params?.query)
  const query = params?.query as
    | { configId?: string; organizationId?: string }
    | undefined
  const hasRequiredParams =
    query?.configId === "organization" ? Boolean(query.organizationId) : true

  return {
    queryKey,
    queryFn:
      userId && hasRequiredParams
        ? ({ signal }) =>
            authClient.apiKey.list({
              ...params,
              fetchOptions: { ...params?.fetchOptions, signal, throw: true }
            }) as Promise<TData>
        : skipToken
  } satisfies QueryOptions
}

/**
 * Get API keys from the cache, fetching them if no cached entry exists.
 * Useful for loaders and guards that need the data before rendering.
 */
export const ensureListApiKeys = <TAuthClient extends ApiKeyAuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId?: string,
  options?: ListApiKeysOptions<TAuthClient>
) => {
  const { fetchOptions, query, ...queryOptions } = options ?? {}

  return queryClient.ensureQueryData({
    ...listApiKeysOptions(authClient, userId, { query, fetchOptions }),
    ...queryOptions
  })
}

/**
 * Prefetch API keys into the query cache without returning the data.
 * Use this to warm the cache ahead of navigation.
 */
export const prefetchListApiKeys = <TAuthClient extends ApiKeyAuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId?: string,
  options?: ListApiKeysOptions<TAuthClient>
) => {
  const { fetchOptions, query, ...queryOptions } = options ?? {}

  return queryClient.prefetchQuery({
    ...listApiKeysOptions(authClient, userId, { query, fetchOptions }),
    ...queryOptions
  })
}

/**
 * Fetch and cache API keys, resolving with data or throwing on error.
 */
export const fetchListApiKeys = <TAuthClient extends ApiKeyAuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId?: string,
  options?: ListApiKeysOptions<TAuthClient>
) => {
  const { fetchOptions, query, ...queryOptions } = options ?? {}

  return queryClient.fetchQuery({
    ...listApiKeysOptions(authClient, userId, { query, fetchOptions }),
    ...queryOptions
  })
}
/**
 * Read API keys synchronously from the query cache without fetching.
 */
export const getListApiKeys = <
  TAuthClient extends ApiKeyAuthClient = ApiKeyAuthClient
>(
  queryClient: QueryClient,
  _authClient?: TAuthClient,
  userId?: string,
  params?: ListApiKeysParams<TAuthClient>
) => {
  const queryKey = apiKeyQueryKeys.list(userId, params?.query)
  return queryClient.getQueryData<ListApiKeysData<TAuthClient>>(queryKey)
}
