import {
  type QueryClient,
  type QueryOptions,
  skipToken
} from "@tanstack/query-core"
import type { AuthClient, InferData } from "../lib/auth-client"
import { authQueryKeys } from "../lib/auth-query-keys"
import { createAuthQueryFetchOptions } from "../lib/auth-query-retry"

export type AccountInfoData<TAuthClient extends AuthClient = AuthClient> =
  InferData<TAuthClient["accountInfo"]>

export type AccountInfoParams<TAuthClient extends AuthClient> = Parameters<
  TAuthClient["accountInfo"]
>[0]

export type AccountInfoOptions<TAuthClient extends AuthClient> = Omit<
  QueryOptions<AccountInfoData<TAuthClient>>,
  "queryKey"
> &
  AccountInfoParams<TAuthClient>

/**
 * Query options factory for provider-specific account info.
 *
 * @param authClient - The Better Auth client.
 * @param userId - The current signed-in user's ID. Used for cache partitioning.
 * @param params - Parameters forwarded to `authClient.accountInfo`.
 */
export function accountInfoOptions<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  userId?: string,
  params?: AccountInfoParams<TAuthClient>
) {
  type TData = AccountInfoData<TAuthClient>
  const query = params?.query
  const queryKey = authQueryKeys.accountInfo(userId, query)

  return {
    queryKey,
    queryFn:
      userId &&
      query &&
      ("useAccountCookie" in query || Boolean(query.accountId))
        ? ({ signal }) =>
            authClient.accountInfo({
              ...params,
              query,
              fetchOptions: createAuthQueryFetchOptions(
                params?.fetchOptions,
                signal
              )
            }) as Promise<TData>
        : skipToken
  } satisfies QueryOptions
}

export const ensureAccountInfo = <TAuthClient extends AuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string,
  options?: AccountInfoOptions<TAuthClient>
) => {
  const { fetchOptions, query, ...queryOptions } = options ?? {}

  return queryClient.ensureQueryData({
    ...accountInfoOptions(
      authClient,
      userId,
      query ? { query, fetchOptions } : undefined
    ),
    ...queryOptions
  })
}

export const prefetchAccountInfo = <TAuthClient extends AuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string,
  options?: AccountInfoOptions<TAuthClient>
) => {
  const { fetchOptions, query, ...queryOptions } = options ?? {}

  return queryClient.prefetchQuery({
    ...accountInfoOptions(
      authClient,
      userId,
      query ? { query, fetchOptions } : undefined
    ),
    ...queryOptions
  })
}

export const fetchAccountInfo = <TAuthClient extends AuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string,
  options?: AccountInfoOptions<TAuthClient>
) => {
  const { fetchOptions, query, ...queryOptions } = options ?? {}

  return queryClient.fetchQuery({
    ...accountInfoOptions(
      authClient,
      userId,
      query ? { query, fetchOptions } : undefined
    ),
    ...queryOptions
  })
}

export const getAccountInfo = <TAuthClient extends AuthClient = AuthClient>(
  queryClient: QueryClient,
  _authClient?: TAuthClient,
  userId?: string,
  params?: AccountInfoParams<TAuthClient>
) => {
  const queryKey = authQueryKeys.accountInfo(userId, params?.query)
  return queryClient.getQueryData<AccountInfoData<TAuthClient>>(queryKey)
}
