import type { DataTag, QueryKey, QueryOptions } from "@tanstack/query-core"
import type { BetterFetchError, BetterFetchOption } from "better-auth/client"

/**
 * Read-style Better Auth client method (params shape `{ query?, fetchOptions? }`).
 * Mutation-style endpoints use `AuthMutationFn` instead.
 */
export type AuthQueryFn<TData = unknown> = (params: {
  query?: Record<string, unknown>
  fetchOptions?: BetterFetchOption
}) => Promise<{ data: TData }>

export type AuthQueryFnData<TFn> =
  TFn extends AuthQueryFn<infer TData> ? TData : never

/**
 * Final query key produced by {@link authQueryOptions}: the caller's prefix
 * followed by `params.query ?? null`.
 */
export type AuthQueryKey<
  TFn extends AuthQueryFn = AuthQueryFn,
  TPrefix extends QueryKey = QueryKey
> = readonly [...TPrefix, NonNullable<Parameters<TFn>[0]>["query"] | null]

export type AuthQueryOptions<
  TFn extends AuthQueryFn = AuthQueryFn,
  TPrefix extends QueryKey = QueryKey
> = Omit<
  QueryOptions<
    AuthQueryFnData<TFn>,
    BetterFetchError,
    AuthQueryFnData<TFn>,
    AuthQueryKey<TFn, TPrefix>
  >,
  "queryKey"
> & {
  queryKey: DataTag<
    AuthQueryKey<TFn, TPrefix>,
    AuthQueryFnData<TFn>,
    BetterFetchError
  >
}

/**
 * Build framework-neutral query options for a Better Auth endpoint.
 *
 * Injects TanStack Query's `signal` and `throw: true` into `fetchOptions` so
 * requests cancel correctly and failures reject as `BetterFetchError`.
 */
export function authQueryOptions<
  TFn extends AuthQueryFn,
  const TPrefix extends QueryKey
>(
  authFn: TFn,
  queryKey: TPrefix,
  params?: Parameters<TFn>[0]
): AuthQueryOptions<TFn, TPrefix> {
  return {
    queryKey: [...queryKey, params?.query ?? null] as unknown as DataTag<
      AuthQueryKey<TFn, TPrefix>,
      AuthQueryFnData<TFn>,
      BetterFetchError
    >,
    queryFn: ({ signal }) =>
      authFn({
        ...params,
        fetchOptions: { ...params?.fetchOptions, signal, throw: true }
      }) as Promise<AuthQueryFnData<TFn>>
  }
}
