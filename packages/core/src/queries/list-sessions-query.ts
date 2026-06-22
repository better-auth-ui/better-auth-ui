import type { DataTag, QueryClient, QueryOptions } from "@tanstack/query-core"
import type { BetterFetchError } from "better-auth/client"
import type { AuthClient, InferData } from "../lib/auth-client"
import { authQueryKeys } from "../lib/auth-query-keys"

export type ListSessionsData<TAuthClient extends AuthClient = AuthClient> =
  InferData<TAuthClient["listSessions"]>

export type ListSessionsParams<TAuthClient extends AuthClient> = Parameters<
  TAuthClient["listSessions"]
>[0]

export type ListSession<TAuthClient extends AuthClient = AuthClient> =
  NonNullable<ListSessionsData<TAuthClient>>[number]

export type ListSessionsOptions<TAuthClient extends AuthClient> = Omit<
  ReturnType<typeof listSessionsOptions<TAuthClient>>,
  "queryKey" | "queryFn"
>

/**
 * Query options factory for the current user's active sessions.
 *
 * @param authClient - The Better Auth client.
 * @param userId - The current signed-in user's ID. Used for cache partitioning.
 * @param params - Parameters forwarded to `authClient.listSessions`.
 */
export function listSessionsOptions<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  userId: string | undefined,
  params?: ListSessionsParams<TAuthClient>
) {
  type TData = ListSessionsData<TAuthClient>
  const queryKey = authQueryKeys.listSessions(userId, params?.query)

  const options = {
    queryKey,
    queryFn: ({ signal }) =>
      authClient.listSessions({
        ...params,
        fetchOptions: { ...params?.fetchOptions, signal, throw: true }
      })
  } as QueryOptions<TData, BetterFetchError, TData, typeof queryKey>

  return options as typeof options & {
    queryKey: DataTag<typeof queryKey, TData, BetterFetchError>
  }
}

export const ensureListSessions = <TAuthClient extends AuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string,
  params?: ListSessionsParams<TAuthClient>
) =>
  queryClient.ensureQueryData(listSessionsOptions(authClient, userId, params))

export const prefetchListSessions = <TAuthClient extends AuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string,
  params?: ListSessionsParams<TAuthClient>
) => queryClient.prefetchQuery(listSessionsOptions(authClient, userId, params))

export const fetchListSessions = <TAuthClient extends AuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string,
  params?: ListSessionsParams<TAuthClient>
) => queryClient.fetchQuery(listSessionsOptions(authClient, userId, params))
