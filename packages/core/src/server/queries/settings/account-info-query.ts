import type { QueryClient, QueryOptions } from "@tanstack/query-core"
import { authRequestData, tagQueryKey } from "../../../lib/auth-request-data"
import type { APIError } from "better-auth"
import { authQueryKeys } from "../../../lib/auth-query-keys"

import type { AuthServer } from "../../../lib/auth-server"

export type AccountInfoData<TAuth extends AuthServer = AuthServer> = Awaited<
  ReturnType<TAuth["api"]["accountInfo"]>
>

export type AccountInfoParams<TAuth extends AuthServer> = Parameters<
  TAuth["api"]["accountInfo"]
>[0]

export type AccountInfo<TAuth extends AuthServer = AuthServer> = NonNullable<
  AccountInfoData<TAuth>
>

/**
 * Query options factory for provider-specific account info.
 *
 * @param auth - The Better Auth server instance.
 * @param userId - The signed-in user's ID. Used for cache partitioning so
 *   the key matches the client-side `accountInfoOptions` for SSR hydration.
 * @param params - Parameters forwarded to `auth.api.accountInfo`.
 */
export function accountInfoOptions<TAuth extends AuthServer>(
  auth: TAuth,
  userId: string,
  params: AccountInfoParams<TAuth>
) {
  type TData = AccountInfoData<TAuth>
  const queryKey = authQueryKeys.accountInfo(userId, params?.query)

  return {
    queryKey: tagQueryKey<TData, APIError, typeof queryKey>(queryKey),
    queryFn: () => authRequestData<TData>(auth.api.accountInfo(params))
  } satisfies QueryOptions<TData, APIError, TData, typeof queryKey>
}

/**
 * Get the current user's provider-specific account info from the query
 * cache, calling `fetchAccountInfo` under the hood if no cached entry
 * exists. Resolves with the data, making it suitable for reading directly
 * in a server component.
 *
 * @param queryClient - The React Query client used for SSR hydration.
 * @param auth - The Better Auth server instance.
 * @param userId - The signed-in user's ID, used for cache partitioning.
 * @param params - Parameters forwarded to `auth.api.accountInfo`.
 */
export const ensureAccountInfo = <TAuth extends AuthServer>(
  queryClient: QueryClient,
  auth: TAuth,
  userId: string,
  params: AccountInfoParams<TAuth>
) => queryClient.ensureQueryData(accountInfoOptions(auth, userId, params))

/**
 * Prefetch the current user's provider-specific account info into the query
 * cache. Behaves like `fetchAccountInfo`, but does not throw on error and
 * does not return the data — use this when you only need the value to be
 * available after hydration.
 *
 * @param queryClient - The React Query client used for SSR hydration.
 * @param auth - The Better Auth server instance.
 * @param userId - The signed-in user's ID, used for cache partitioning.
 * @param params - Parameters forwarded to `auth.api.accountInfo`.
 */
export const prefetchAccountInfo = <TAuth extends AuthServer>(
  queryClient: QueryClient,
  auth: TAuth,
  userId: string,
  params: AccountInfoParams<TAuth>
) => queryClient.prefetchQuery(accountInfoOptions(auth, userId, params))

/**
 * Fetch and cache the current user's provider-specific account info,
 * resolving with the data or throwing on error. If a cached entry exists
 * and is neither invalidated nor older than `staleTime`, the cached value
 * is returned without a network call; otherwise the latest data is fetched.
 *
 * @param queryClient - The React Query client used for SSR hydration.
 * @param auth - The Better Auth server instance.
 * @param userId - The signed-in user's ID, used for cache partitioning.
 * @param params - Parameters forwarded to `auth.api.accountInfo`.
 */
export const fetchAccountInfo = <TAuth extends AuthServer>(
  queryClient: QueryClient,
  auth: TAuth,
  userId: string,
  params: AccountInfoParams<TAuth>
) => queryClient.fetchQuery(accountInfoOptions(auth, userId, params))
