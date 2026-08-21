import {
  type QueryClient,
  type QueryOptions,
  skipToken
} from "@tanstack/query-core"
import type { InferData } from "../../lib/auth-client"
import { createAuthQueryFetchOptions } from "../../lib/auth-query-retry"
import type { ApiKeyAuthClient } from "./api-key-auth-client"
import { apiKeyQueryKeys } from "./api-key-query-keys"

/** Data returned by Better Auth's API key get endpoint. */
export type GetApiKeyData<
  TAuthClient extends ApiKeyAuthClient = ApiKeyAuthClient
> = InferData<TAuthClient["apiKey"]["get"]>

/** Parameters accepted by Better Auth's API key get endpoint. */
export type GetApiKeyParams<
  TAuthClient extends ApiKeyAuthClient = ApiKeyAuthClient
> = Parameters<TAuthClient["apiKey"]["get"]>[0]

/** Query options for one API key, excluding the generated query key. */
export type GetApiKeyOptions<
  TAuthClient extends ApiKeyAuthClient = ApiKeyAuthClient
> = Omit<QueryOptions<GetApiKeyData<TAuthClient>>, "queryKey"> &
  GetApiKeyParams<TAuthClient>

/**
 * Query options factory for one API key visible to the current user.
 *
 * @param authClient - The Better Auth API key client.
 * @param userId - The signed-in user's ID. Used for cache partitioning.
 * @param params - Parameters forwarded to `authClient.apiKey.get`.
 */
export function getApiKeyOptions<TAuthClient extends ApiKeyAuthClient>(
  authClient: TAuthClient,
  userId?: string,
  params?: GetApiKeyParams<TAuthClient>
) {
  type TData = GetApiKeyData<TAuthClient>
  const queryKey = apiKeyQueryKeys.detail(userId, params?.query)

  return {
    queryKey,
    queryFn:
      userId && params?.query?.id
        ? ({ signal }) =>
            authClient.apiKey.get({
              ...params,
              fetchOptions: createAuthQueryFetchOptions(
                params.fetchOptions,
                signal
              )
            }) as Promise<TData>
        : skipToken
  } satisfies QueryOptions
}

/** Get one API key from cache, fetching it when needed. */
export const ensureGetApiKey = <TAuthClient extends ApiKeyAuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string,
  options: GetApiKeyOptions<TAuthClient>
) => {
  const { fetchOptions, query, ...queryOptions } = options

  return queryClient.ensureQueryData({
    ...getApiKeyOptions(authClient, userId, { query, fetchOptions }),
    ...queryOptions
  })
}

/** Prefetch one API key into the query cache. */
export const prefetchGetApiKey = <TAuthClient extends ApiKeyAuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string,
  options: GetApiKeyOptions<TAuthClient>
) => {
  const { fetchOptions, query, ...queryOptions } = options

  return queryClient.prefetchQuery({
    ...getApiKeyOptions(authClient, userId, { query, fetchOptions }),
    ...queryOptions
  })
}

/** Fetch and cache one API key, resolving with data or throwing. */
export const fetchGetApiKey = <TAuthClient extends ApiKeyAuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string,
  options: GetApiKeyOptions<TAuthClient>
) => {
  const { fetchOptions, query, ...queryOptions } = options

  return queryClient.fetchQuery({
    ...getApiKeyOptions(authClient, userId, { query, fetchOptions }),
    ...queryOptions
  })
}

/** Read one API key synchronously from the query cache. */
export const getApiKey = <
  TAuthClient extends ApiKeyAuthClient = ApiKeyAuthClient
>(
  queryClient: QueryClient,
  _authClient?: TAuthClient,
  userId?: string,
  params?: GetApiKeyParams<TAuthClient>
) =>
  queryClient.getQueryData<GetApiKeyData<TAuthClient>>(
    apiKeyQueryKeys.detail(userId, params?.query)
  )
