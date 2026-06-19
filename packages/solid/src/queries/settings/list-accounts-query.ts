import { authQueryKeys } from "@better-auth-ui/core"
import type { QueryClient } from "@tanstack/solid-query"
import { useSession } from "../../hooks/queries/use-session"
import type { AuthClient, InferData } from "../../lib/auth-client"
import {
  createUserScopedOptions,
  createUserScopedQuery,
  ensureUserScopedQuery,
  fetchUserScopedQuery,
  getSessionUserId,
  prefetchUserScopedQuery
} from "../create-user-scoped-query"

export type ListAccountsData<TAuthClient extends AuthClient> = InferData<
  TAuthClient["listAccounts"]
>
export type ListAccountsParams<TAuthClient extends AuthClient> = Parameters<
  TAuthClient["listAccounts"]
>[0]
export type ListAccountsOptions<TAuthClient extends AuthClient> = Omit<
  ReturnType<typeof listAccountsOptions<TAuthClient>>,
  "queryKey" | "queryFn"
>

export function listAccountsOptions<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  userId: string | undefined,
  params?: ListAccountsParams<TAuthClient>
) {
  return createUserScopedOptions(
    authQueryKeys.listAccounts(userId, params?.query),
    authClient.listAccounts,
    params
  )
}

export const ensureListAccounts = <TAuthClient extends AuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string,
  params?: ListAccountsParams<TAuthClient>
) =>
  ensureUserScopedQuery(
    queryClient,
    authQueryKeys.listAccounts(userId, params?.query),
    authClient.listAccounts,
    params
  )

export const prefetchListAccounts = <TAuthClient extends AuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string,
  params?: ListAccountsParams<TAuthClient>
) =>
  prefetchUserScopedQuery(
    queryClient,
    authQueryKeys.listAccounts(userId, params?.query),
    authClient.listAccounts,
    params
  )

export const fetchListAccounts = <TAuthClient extends AuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string,
  params?: ListAccountsParams<TAuthClient>
) =>
  fetchUserScopedQuery(
    queryClient,
    authQueryKeys.listAccounts(userId, params?.query),
    authClient.listAccounts,
    params
  )

export type UseListAccountsOptions<TAuthClient extends AuthClient> =
  ListAccountsOptions<TAuthClient> & ListAccountsParams<TAuthClient>

export function useListAccounts<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options: UseListAccountsOptions<TAuthClient> = {}
) {
  const session = useSession(authClient)
  const userId = () => getSessionUserId(session)
  const { query, fetchOptions, ...queryOptionsRest } = options

  return createUserScopedQuery(
    () => authQueryKeys.listAccounts(userId(), query),
    authClient.listAccounts,
    () => ({ query, fetchOptions }) as ListAccountsParams<TAuthClient>,
    () => Boolean(userId()),
    () => queryOptionsRest
  )
}
