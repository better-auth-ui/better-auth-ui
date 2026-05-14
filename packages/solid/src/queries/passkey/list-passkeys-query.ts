import { authQueryKeys } from "@better-auth-ui/core"
import type { QueryClient } from "@tanstack/solid-query"
import type { InferData, PasskeyAuthClient } from "../../lib/auth-client"
import { useSession } from "../auth/session-query"
import {
  createUserScopedOptions,
  createUserScopedQuery,
  ensureUserScopedQuery,
  fetchUserScopedQuery,
  getSessionUserId,
  prefetchUserScopedQuery
} from "../create-user-scoped-query"

export type ListPasskeysData<TAuthClient extends PasskeyAuthClient> = InferData<
  TAuthClient["passkey"]["listUserPasskeys"]
>
export type ListPasskeysParams<TAuthClient extends PasskeyAuthClient> =
  Parameters<TAuthClient["passkey"]["listUserPasskeys"]>[0]
export type ListPasskeysOptions<TAuthClient extends PasskeyAuthClient> = Omit<
  ReturnType<typeof listPasskeysOptions<TAuthClient>>,
  "queryKey" | "queryFn"
>

export function listPasskeysOptions<TAuthClient extends PasskeyAuthClient>(
  authClient: TAuthClient,
  userId: string | undefined,
  params?: ListPasskeysParams<TAuthClient>
) {
  return createUserScopedOptions(
    authQueryKeys.listPasskeys(userId, params?.query),
    authClient.passkey.listUserPasskeys,
    params
  )
}

export const ensureListPasskeys = <TAuthClient extends PasskeyAuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string,
  params?: ListPasskeysParams<TAuthClient>
) =>
  ensureUserScopedQuery(
    queryClient,
    authQueryKeys.listPasskeys(userId, params?.query),
    authClient.passkey.listUserPasskeys,
    params
  )

export const prefetchListPasskeys = <TAuthClient extends PasskeyAuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string,
  params?: ListPasskeysParams<TAuthClient>
) =>
  prefetchUserScopedQuery(
    queryClient,
    authQueryKeys.listPasskeys(userId, params?.query),
    authClient.passkey.listUserPasskeys,
    params
  )

export const fetchListPasskeys = <TAuthClient extends PasskeyAuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string,
  params?: ListPasskeysParams<TAuthClient>
) =>
  fetchUserScopedQuery(
    queryClient,
    authQueryKeys.listPasskeys(userId, params?.query),
    authClient.passkey.listUserPasskeys,
    params
  )

export type UseListPasskeysOptions<TAuthClient extends PasskeyAuthClient> =
  ListPasskeysOptions<TAuthClient> & ListPasskeysParams<TAuthClient>

export function useListPasskeys<TAuthClient extends PasskeyAuthClient>(
  authClient: TAuthClient,
  options: UseListPasskeysOptions<TAuthClient> = {}
) {
  const session = useSession(authClient)
  const userId = () => getSessionUserId(session)
  const { query, fetchOptions, ...queryOptionsRest } = options

  return createUserScopedQuery(
    () => authQueryKeys.listPasskeys(userId(), query),
    authClient.passkey.listUserPasskeys,
    () => ({ query, fetchOptions }) as ListPasskeysParams<TAuthClient>,
    () => Boolean(userId()),
    () => queryOptionsRest
  )
}
