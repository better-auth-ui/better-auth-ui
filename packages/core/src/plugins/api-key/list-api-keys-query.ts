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

export function listApiKeysOptions<TAuthClient extends ApiKeyAuthClient>(
  authClient: TAuthClient,
  userId?: string,
  params?: ListApiKeysParams<TAuthClient>
) {
  type TData = ListApiKeysData<TAuthClient>
  const queryKey = apiKeyQueryKeys.list(userId, params?.query)

  return {
    queryKey,
    queryFn: userId
      ? ({ signal }) =>
          authClient.apiKey.list({
            ...params,
            fetchOptions: { ...params?.fetchOptions, signal, throw: true }
          }) as Promise<TData>
      : skipToken
  } satisfies QueryOptions
}

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
