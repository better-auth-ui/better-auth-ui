import {
  type AuthQueryFn,
  type AuthQueryFnData,
  type AuthQueryKey,
  authQueryOptions as coreAuthQueryOptions
} from "@better-auth-ui/core"
import type { DataTag, QueryKey, UseQueryOptions } from "@tanstack/react-query"
import type { BetterFetchError } from "better-auth/client"

export type { AuthQueryFn, AuthQueryFnData, AuthQueryKey }

/**
 * Return type of {@link authQueryOptions}. Named so TypeScript emits
 * `DataTag<…>` by reference in the `.d.ts`, instead of the raw
 * `{ [dataTagSymbol]: … }` intersection — which triggers a declaration-emit
 * bug where `dataTagSymbol` isn't re-imported at the use site and silently
 * breaks `setQueryData`/`getQueryData` type inference at the consumer.
 */
export type AuthQueryOptions<
  TFn extends AuthQueryFn = AuthQueryFn,
  TPrefix extends QueryKey = QueryKey
> = Omit<
  UseQueryOptions<
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
 * React adapter for core Better Auth query options.
 */
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
