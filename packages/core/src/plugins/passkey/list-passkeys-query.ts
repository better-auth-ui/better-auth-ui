import {
  type QueryClient,
  type QueryOptions,
  skipToken
} from "@tanstack/query-core"
import type { InferData } from "../../lib/auth-client"
import type { PasskeyAuthClient } from "./passkey-auth-client"
import { passkeyQueryKeys } from "./passkey-query-keys"

/**
 * Data returned by the Better Auth passkey list endpoint.
 */
export type ListPasskeysData<
  TAuthClient extends PasskeyAuthClient = PasskeyAuthClient
> = InferData<TAuthClient["passkey"]["listUserPasskeys"]>

/**
 * Parameters accepted by the Better Auth passkey list endpoint.
 */
export type ListPasskeysParams<
  TAuthClient extends PasskeyAuthClient = PasskeyAuthClient
> = Parameters<TAuthClient["passkey"]["listUserPasskeys"]>[0]

/**
 * Single passkey item returned by the passkey list endpoint.
 */
export type ListPasskey<
  TAuthClient extends PasskeyAuthClient = PasskeyAuthClient
> = NonNullable<ListPasskeysData<TAuthClient>>[number]

/**
 * Query options for listing passkeys, excluding the generated query key.
 */
export type ListPasskeysOptions<
  TAuthClient extends PasskeyAuthClient = PasskeyAuthClient
> = Omit<QueryOptions<ListPasskeysData<TAuthClient>>, "queryKey"> &
  ListPasskeysParams<TAuthClient>

/**
 * Query options factory for listing the current user's passkeys.
 *
 * @param authClient - The Better Auth client with the passkey plugin.
 * @param userId - The current signed-in user's ID. Used for cache partitioning.
 * @param params - Parameters forwarded to the passkey list endpoint.
 */
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

/**
 * Get passkeys from cache, fetching them if needed.
 */
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

/**
 * Prefetch passkeys into the query cache.
 */
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

/**
 * Fetch and cache passkeys, resolving with data or throwing.
 */
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
/**
 * Read passkeys synchronously from the query cache.
 */
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
