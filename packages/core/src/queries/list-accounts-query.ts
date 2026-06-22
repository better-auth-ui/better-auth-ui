import type { DataTag, QueryClient, QueryOptions } from "@tanstack/query-core"
import type { BetterFetchError } from "better-auth/client"
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
  ReturnType<typeof listAccountsOptions<TAuthClient>>,
  "queryKey" | "queryFn"
>

/**
 * Query options factory for a user's linked social accounts.
 *
 * @param authClient - The Better Auth client.
 * @param userId - The current signed-in user's ID. Used for cache partitioning.
 * @param params - Parameters forwarded to `authClient.listAccounts`.
 */
export function listAccountsOptions<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  userId: string | undefined,
  params?: ListAccountsParams<TAuthClient>
) {
  type TData = ListAccountsData<TAuthClient>
  const queryKey = authQueryKeys.listAccounts(userId, params?.query)

  const options = {
    queryKey,
    queryFn: ({ signal }) =>
      authClient.listAccounts({
        ...params,
        fetchOptions: { ...params?.fetchOptions, signal, throw: true }
      })
  } as QueryOptions<TData, BetterFetchError, TData, typeof queryKey>

  return options as typeof options & {
    queryKey: DataTag<typeof queryKey, TData, BetterFetchError>
  }
}

export const ensureListAccounts = <TAuthClient extends AuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string,
  params?: ListAccountsParams<TAuthClient>
) =>
  queryClient.ensureQueryData(listAccountsOptions(authClient, userId, params))

export const prefetchListAccounts = <TAuthClient extends AuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string,
  params?: ListAccountsParams<TAuthClient>
) => queryClient.prefetchQuery(listAccountsOptions(authClient, userId, params))

export const fetchListAccounts = <TAuthClient extends AuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string,
  params?: ListAccountsParams<TAuthClient>
) => queryClient.fetchQuery(listAccountsOptions(authClient, userId, params))
