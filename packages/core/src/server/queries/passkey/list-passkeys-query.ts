import type { DataTag, QueryClient, QueryOptions } from "@tanstack/query-core"
import type { APIError } from "better-auth"
import { passkeyQueryKeys } from "../../../plugins/passkey"
import type { PasskeyAuthServer } from "../../../plugins/passkey/server/passkey-auth-server"

export type ListPasskeysData<TAuth extends PasskeyAuthServer> = Awaited<
  ReturnType<TAuth["api"]["listPasskeys"]>
>

export type ListPasskeysParams<TAuth extends PasskeyAuthServer> = Parameters<
  TAuth["api"]["listPasskeys"]
>[0]

export type ListPasskey<TAuth extends PasskeyAuthServer = PasskeyAuthServer> =
  NonNullable<ListPasskeysData<TAuth>>[number]

/**
 * Query options factory for the current user's passkeys.
 *
 * @param auth - The Better Auth server instance with the passkey plugin.
 * @param userId - The signed-in user's ID. Used for cache partitioning so
 *   the key matches the client-side `listPasskeysOptions` for SSR hydration.
 * @param params - Parameters forwarded to `auth.api.listPasskeys`.
 */
export function listPasskeysOptions<TAuth extends PasskeyAuthServer>(
  auth: TAuth,
  userId: string,
  params: ListPasskeysParams<TAuth>
) {
  type TData = ListPasskeysData<TAuth>
  const queryKey = passkeyQueryKeys.list(userId, params?.query)

  const options = {
    queryKey,
    queryFn: () => auth.api.listPasskeys(params) as Promise<TData>
  } as QueryOptions<TData, APIError, TData, typeof queryKey>

  return options as typeof options & {
    queryKey: DataTag<typeof queryKey, TData, APIError>
  }
}

/**
 * Get the current user's passkeys from the query cache, calling
 * `fetchListPasskeys` under the hood if no cached entry exists. Resolves
 * with the passkey list, making it suitable for reading directly in a server
 * component.
 *
 * @param queryClient - The React Query client used for SSR hydration.
 * @param auth - The Better Auth server instance with the passkey plugin.
 * @param userId - The signed-in user's ID, used for cache partitioning.
 * @param params - Parameters forwarded to `auth.api.listPasskeys`.
 */
export const ensureListPasskeys = <TAuth extends PasskeyAuthServer>(
  queryClient: QueryClient,
  auth: TAuth,
  userId: string,
  params: ListPasskeysParams<TAuth>
) => queryClient.ensureQueryData(listPasskeysOptions(auth, userId, params))

/**
 * Prefetch the current user's passkeys into the query cache. Behaves like
 * `fetchListPasskeys`, but does not throw on error and does not return
 * the data — use this when you only need the value to be available after
 * hydration.
 *
 * @param queryClient - The React Query client used for SSR hydration.
 * @param auth - The Better Auth server instance with the passkey plugin.
 * @param userId - The signed-in user's ID, used for cache partitioning.
 * @param params - Parameters forwarded to `auth.api.listPasskeys`.
 */
export const prefetchListPasskeys = <TAuth extends PasskeyAuthServer>(
  queryClient: QueryClient,
  auth: TAuth,
  userId: string,
  params: ListPasskeysParams<TAuth>
) => queryClient.prefetchQuery(listPasskeysOptions(auth, userId, params))

/**
 * Fetch and cache the current user's passkeys, resolving with the data or
 * throwing on error. If a cached entry exists and is neither invalidated
 * nor older than `staleTime`, the cached value is returned without a
 * network call; otherwise the latest data is fetched.
 *
 * @param queryClient - The React Query client used for SSR hydration.
 * @param auth - The Better Auth server instance with the passkey plugin.
 * @param userId - The signed-in user's ID, used for cache partitioning.
 * @param params - Parameters forwarded to `auth.api.listPasskeys`.
 */
export const fetchListPasskeys = <TAuth extends PasskeyAuthServer>(
  queryClient: QueryClient,
  auth: TAuth,
  userId: string,
  params: ListPasskeysParams<TAuth>
) => queryClient.fetchQuery(listPasskeysOptions(auth, userId, params))
