import {
  type AuthQueryFn,
  type AuthQueryFnData,
  type AuthQueryKey,
  authQueryOptions as coreAuthQueryOptions
} from "@better-auth-ui/core"
import type {
  CreateQueryOptions,
  DataTag,
  QueryKey
} from "@tanstack/solid-query"
import type { BetterFetchError } from "better-auth/client"

export type { AuthQueryFn, AuthQueryFnData, AuthQueryKey }

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
  return coreAuthQueryOptions(authFn, queryKey, params) as AuthQueryOptions<
    TFn,
    TPrefix
  >
}
