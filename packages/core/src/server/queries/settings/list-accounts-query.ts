import type { DataTag, QueryClient, QueryOptions } from "@tanstack/query-core"
import type { APIError } from "better-auth"
import { authQueryKeys } from "../../../lib/auth-query-keys"

import type { AuthServer } from "../../../lib/auth-server"

export type ListAccountsData<TAuth extends AuthServer = AuthServer> = Awaited<
  ReturnType<TAuth["api"]["listUserAccounts"]>
>

export type ListAccountsParams<TAuth extends AuthServer> = Parameters<
  TAuth["api"]["listUserAccounts"]
>[0]

export type ListAccount<TAuth extends AuthServer = AuthServer> = NonNullable<
  ListAccountsData<TAuth>
>[number]

/**
 * Query options factory for the current user's linked social accounts.
 *
 * @param auth - The Better Auth server instance.
 * @param userId - The signed-in user's ID. Used for cache partitioning so
 *   the key matches the client-side `listAccountsOptions` for SSR hydration.
 * @param params - Parameters forwarded to `auth.api.listUserAccounts`.
 */
export function listAccountsOptions<TAuth extends AuthServer>(
  auth: TAuth,
  userId: string,
  params: ListAccountsParams<TAuth>
) {
  type TData = ListAccountsData<TAuth>
  const queryKey = authQueryKeys.listAccounts(userId, params?.query)

  const options = {
    queryKey,
    queryFn: () => auth.api.listUserAccounts(params) as Promise<TData>
  } as QueryOptions<TData, APIError, TData, typeof queryKey>

  return options as typeof options & {
    queryKey: DataTag<typeof queryKey, TData, APIError>
  }
}

/**
 * Get the current user's linked social accounts from the query cache,
 * calling `fetchListAccounts` under the hood if no cached entry exists.
 * Resolves with the account list, making it suitable for reading directly
 * in a server component.
 *
 * @param queryClient - The React Query client used for SSR hydration.
 * @param auth - The Better Auth server instance.
 * @param userId - The signed-in user's ID, used for cache partitioning.
 * @param params - Parameters forwarded to `auth.api.listUserAccounts`.
 */
export const ensureListAccounts = <TAuth extends AuthServer>(
  queryClient: QueryClient,
  auth: TAuth,
  userId: string,
  params: ListAccountsParams<TAuth>
) => queryClient.ensureQueryData(listAccountsOptions(auth, userId, params))

/**
 * Prefetch the current user's linked social accounts into the query cache.
 * Behaves like `fetchListAccounts`, but does not throw on error and does
 * not return the data — use this when you only need the value to be
 * available after hydration.
 *
 * @param queryClient - The React Query client used for SSR hydration.
 * @param auth - The Better Auth server instance.
 * @param userId - The signed-in user's ID, used for cache partitioning.
 * @param params - Parameters forwarded to `auth.api.listUserAccounts`.
 */
export const prefetchListAccounts = <TAuth extends AuthServer>(
  queryClient: QueryClient,
  auth: TAuth,
  userId: string,
  params: ListAccountsParams<TAuth>
) => queryClient.prefetchQuery(listAccountsOptions(auth, userId, params))

/**
 * Fetch and cache the current user's linked social accounts, resolving
 * with the data or throwing on error. If a cached entry exists and is
 * neither invalidated nor older than `staleTime`, the cached value is
 * returned without a network call; otherwise the latest data is fetched.
 *
 * @param queryClient - The React Query client used for SSR hydration.
 * @param auth - The Better Auth server instance.
 * @param userId - The signed-in user's ID, used for cache partitioning.
 * @param params - Parameters forwarded to `auth.api.listUserAccounts`.
 */
export const fetchListAccounts = <TAuth extends AuthServer>(
  queryClient: QueryClient,
  auth: TAuth,
  userId: string,
  params: ListAccountsParams<TAuth>
) => queryClient.fetchQuery(listAccountsOptions(auth, userId, params))
