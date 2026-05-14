import { authQueryKeys } from "@better-auth-ui/core"
import type { QueryClient } from "@tanstack/solid-query"
import type { AuthClient, InferData } from "../../lib/auth-client"
import { useSession } from "../auth/session-query"
import {
  createUserScopedOptions,
  createUserScopedQuery,
  ensureUserScopedQuery,
  fetchUserScopedQuery,
  getSessionUserId,
  prefetchUserScopedQuery
} from "../create-user-scoped-query"

export type AccountInfoData<TAuthClient extends AuthClient> = InferData<
  TAuthClient["accountInfo"]
>
export type AccountInfoParams<TAuthClient extends AuthClient> = Parameters<
  TAuthClient["accountInfo"]
>[0]
export type AccountInfoOptions<TAuthClient extends AuthClient> = Omit<
  ReturnType<typeof accountInfoOptions<TAuthClient>>,
  "queryKey" | "queryFn"
>

export function accountInfoOptions<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  userId: string | undefined,
  params?: AccountInfoParams<TAuthClient>
) {
  return createUserScopedOptions(
    authQueryKeys.accountInfo(userId, params?.query),
    authClient.accountInfo,
    params
  )
}

export const ensureAccountInfo = <TAuthClient extends AuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string,
  params?: AccountInfoParams<TAuthClient>
) =>
  ensureUserScopedQuery(
    queryClient,
    authQueryKeys.accountInfo(userId, params?.query),
    authClient.accountInfo,
    params
  )

export const prefetchAccountInfo = <TAuthClient extends AuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string,
  params?: AccountInfoParams<TAuthClient>
) =>
  prefetchUserScopedQuery(
    queryClient,
    authQueryKeys.accountInfo(userId, params?.query),
    authClient.accountInfo,
    params
  )

export const fetchAccountInfo = <TAuthClient extends AuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string,
  params?: AccountInfoParams<TAuthClient>
) =>
  fetchUserScopedQuery(
    queryClient,
    authQueryKeys.accountInfo(userId, params?.query),
    authClient.accountInfo,
    params
  )

export type UseAccountInfoOptions<TAuthClient extends AuthClient> =
  AccountInfoOptions<TAuthClient> & AccountInfoParams<TAuthClient>

export function useAccountInfo<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options: UseAccountInfoOptions<TAuthClient> = {}
) {
  const session = useSession(authClient)
  const userId = () => getSessionUserId(session)
  const { query, fetchOptions, ...queryOptionsRest } = options

  return createUserScopedQuery(
    () => authQueryKeys.accountInfo(userId(), query),
    authClient.accountInfo,
    () => ({ query, fetchOptions }) as AccountInfoParams<TAuthClient>,
    () => Boolean(userId() && query?.accountId),
    () => queryOptionsRest
  )
}
