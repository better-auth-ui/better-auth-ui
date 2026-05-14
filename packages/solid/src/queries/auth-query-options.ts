import {
  type CreateQueryOptions,
  type DataTag,
  type QueryKey,
  queryOptions
} from "@tanstack/solid-query"
import type { BetterFetchError, BetterFetchOption } from "better-auth/client"

export type AuthQueryFn<TData = unknown> = (params: {
  query?: Record<string, unknown>
  fetchOptions?: BetterFetchOption
}) => Promise<{ data: TData }>

export type AuthQueryFnData<TFn> =
  TFn extends AuthQueryFn<infer TData> ? TData : never

export type AuthQueryKey<
  TFn extends AuthQueryFn = AuthQueryFn,
  TPrefix extends QueryKey = QueryKey
> = readonly [...TPrefix, NonNullable<Parameters<TFn>[0]>["query"] | null]

export type AuthQueryOptions<
  TFn extends AuthQueryFn = AuthQueryFn,
  TPrefix extends QueryKey = QueryKey
> = Omit<
  CreateQueryOptions<
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

export function authQueryOptions<
  TFn extends AuthQueryFn,
  const TPrefix extends QueryKey
>(
  authFn: TFn,
  queryKey: TPrefix,
  params?: Parameters<TFn>[0]
): AuthQueryOptions<TFn, TPrefix> {
  return queryOptions<AuthQueryFnData<TFn>, BetterFetchError>({
    queryKey: [...queryKey, params?.query ?? null] as const,
    queryFn: ({ signal }) =>
      authFn({
        ...params,
        fetchOptions: { ...params?.fetchOptions, signal, throw: true }
      }) as Promise<AuthQueryFnData<TFn>>
  }) as AuthQueryOptions<TFn, TPrefix>
}
