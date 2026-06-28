import {
  type AuthQueryFn,
  type AuthQueryFnData,
  type AuthQueryKey,
  authQueryOptions
} from "@better-auth-ui/core"
import {
  type QueryKey,
  type UseQueryOptions,
  useQuery
} from "@tanstack/react-query"
import type { BetterFetchError } from "better-auth/client"

type UseAuthQueryOptions<
  TFn extends AuthQueryFn,
  TPrefix extends QueryKey
> = Omit<
  UseQueryOptions<
    AuthQueryFnData<TFn>,
    BetterFetchError,
    AuthQueryFnData<TFn>,
    AuthQueryKey<TFn, TPrefix>
  >,
  "queryKey" | "queryFn"
> &
  Pick<NonNullable<Parameters<TFn>[0]>, "query" | "fetchOptions">

/**
 * Escape-hatch hook for Better Auth endpoints that don't have a purpose-built
 * hook in this library yet. Thin wrapper over `useQuery` and `authQueryOptions`.
 *
 * @param authFn - Better Auth client method (e.g. `authClient.magicLink.list`).
 * @param queryKey - Scope prefix for the key. `options.query` is appended automatically.
 * @param options - Better Auth params (`query`, `fetchOptions`) and React
 *   Query options forwarded to `useQuery`.
 */
export function useAuthQuery<
  TFn extends AuthQueryFn,
  const TQueryKey extends QueryKey
>(
  authFn: TFn,
  queryKey: TQueryKey,
  options?: UseAuthQueryOptions<TFn, TQueryKey>
) {
  const { query, fetchOptions, ...queryOptions } = options ?? {}

  return useQuery({
    ...authQueryOptions(authFn, queryKey, {
      query,
      fetchOptions
    } as Parameters<TFn>[0]),
    ...queryOptions
  })
}
