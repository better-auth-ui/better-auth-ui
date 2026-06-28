import {
  type QueryClient,
  type QueryOptions,
  skipToken
} from "@tanstack/query-core"
import type { InferData } from "../../lib/auth-client"
import type { PasskeyAuthClient } from "./passkey-auth-client"
import { passkeyQueryKeys } from "./passkey-query-keys"

export type ListPasskeysData<
  TAuthClient extends PasskeyAuthClient = PasskeyAuthClient
> = InferData<TAuthClient["passkey"]["listUserPasskeys"]>

export type ListPasskeysParams<
  TAuthClient extends PasskeyAuthClient = PasskeyAuthClient
> = Parameters<TAuthClient["passkey"]["listUserPasskeys"]>[0]

export type ListPasskey<
  TAuthClient extends PasskeyAuthClient = PasskeyAuthClient
> = NonNullable<ListPasskeysData<TAuthClient>>[number]

export type ListPasskeysOptions<
  TAuthClient extends PasskeyAuthClient = PasskeyAuthClient
> = Omit<QueryOptions<ListPasskeysData<TAuthClient>>, "queryKey"> &
  ListPasskeysParams<TAuthClient>

export function listPasskeysOptions<TAuthClient extends PasskeyAuthClient>(
  authClient: TAuthClient,
  userId?: string,
  params?: ListPasskeysParams<TAuthClient>
) {
  type TData = ListPasskeysData<TAuthClient>
  const queryKey = passkeyQueryKeys.list(userId, params?.query)

  return {
    queryKey,
    queryFn: userId
      ? ({ signal }) =>
          authClient.passkey.listUserPasskeys({
            ...params,
            fetchOptions: { ...params?.fetchOptions, signal, throw: true }
          }) as Promise<TData>
      : skipToken
  } satisfies QueryOptions
}

export const ensureListPasskeys = <TAuthClient extends PasskeyAuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId?: string,
  options?: ListPasskeysOptions<TAuthClient>
) => {
  const { fetchOptions, query, ...queryOptions } = options ?? {}

  return queryClient.ensureQueryData({
    ...listPasskeysOptions(authClient, userId, { query, fetchOptions }),
    ...queryOptions
  })
}

export const prefetchListPasskeys = <TAuthClient extends PasskeyAuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId?: string,
  options?: ListPasskeysOptions<TAuthClient>
) => {
  const { fetchOptions, query, ...queryOptions } = options ?? {}

  return queryClient.prefetchQuery({
    ...listPasskeysOptions(authClient, userId, { query, fetchOptions }),
    ...queryOptions
  })
}

export const fetchListPasskeys = <TAuthClient extends PasskeyAuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId?: string,
  options?: ListPasskeysOptions<TAuthClient>
) => {
  const { fetchOptions, query, ...queryOptions } = options ?? {}

  return queryClient.fetchQuery({
    ...listPasskeysOptions(authClient, userId, { query, fetchOptions }),
    ...queryOptions
  })
}
export const getListPasskeys = <
  TAuthClient extends PasskeyAuthClient = PasskeyAuthClient
>(
  queryClient: QueryClient,
  _authClient?: TAuthClient,
  userId?: string,
  params?: ListPasskeysParams<TAuthClient>
) => {
  const queryKey = passkeyQueryKeys.list(userId, params?.query)
  return queryClient.getQueryData<ListPasskeysData<TAuthClient>>(queryKey)
}
