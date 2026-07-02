import {
  type QueryClient,
  type QueryOptions,
  skipToken
} from "@tanstack/query-core"
import type { AuthClient, InferData } from "../lib/auth-client"
import { authQueryKeys } from "../lib/auth-query-keys"

export type ListAccountsData<TAuthClient extends AuthClient = AuthClient> =
  InferData<TAuthClient["listAccounts"]>

export type ListAccountsParams<TAuthClient extends AuthClient> = Parameters<
  TAuthClient["listAccounts"]
>[0]

export type ListAccount<TAuthClient extends AuthClient = AuthClient> =
  NonNullable<ListAccountsData<TAuthClient>>[number]

export type ListAccountsOptions<TAuthClient extends AuthClient> = Omit<
  QueryOptions<ListAccountsData<TAuthClient>>,
  "queryKey"
> &
  ListAccountsParams<TAuthClient>

/**
 * Query options factory for a user's linked social accounts.
 *
 * @param authClient - The Better Auth client.
 * @param userId - The current signed-in user's ID. Used for cache partitioning.
 * @param params - Parameters forwarded to `authClient.listAccounts`.
 */
export function listAccountsOptions<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  userId?: string,
  params?: ListAccountsParams<TAuthClient>
) {
  type TData = ListAccountsData<TAuthClient>
  const queryKey = authQueryKeys.listAccounts(userId, params?.query)

  return {
    queryKey,
    queryFn: userId
      ? ({ signal }) =>
          authClient.listAccounts({
            ...params,
            fetchOptions: { ...params?.fetchOptions, signal, throw: true }
          }) as Promise<TData>
      : skipToken
  } satisfies QueryOptions
}

export const ensureListAccounts = <TAuthClient extends AuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId?: string,
  options?: ListAccountsOptions<TAuthClient>
) => {
  const { fetchOptions, query, ...queryOptions } = options ?? {}

  return queryClient.ensureQueryData({
    ...listAccountsOptions(authClient, userId, { query, fetchOptions }),
    ...queryOptions
  })
}

export const prefetchListAccounts = <TAuthClient extends AuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId?: string,
  options?: ListAccountsOptions<TAuthClient>
) => {
  const { fetchOptions, query, ...queryOptions } = options ?? {}

  return queryClient.prefetchQuery({
    ...listAccountsOptions(authClient, userId, { query, fetchOptions }),
    ...queryOptions
  })
}

export const fetchListAccounts = <TAuthClient extends AuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId?: string,
  options?: ListAccountsOptions<TAuthClient>
) => {
  const { fetchOptions, query, ...queryOptions } = options ?? {}

  return queryClient.fetchQuery({
    ...listAccountsOptions(authClient, userId, { query, fetchOptions }),
    ...queryOptions
  })
}

export const getListAccounts = <TAuthClient extends AuthClient = AuthClient>(
  queryClient: QueryClient,
  _authClient?: TAuthClient,
  userId?: string,
  params?: ListAccountsParams<TAuthClient>
) => {
  const queryKey = authQueryKeys.listAccounts(userId, params?.query)
  return queryClient.getQueryData<ListAccountsData<TAuthClient>>(queryKey)
}
