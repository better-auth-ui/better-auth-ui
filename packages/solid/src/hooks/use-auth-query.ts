import { createQuery, type QueryKey } from "@tanstack/solid-query"
import {
  type AuthQueryFn,
  type AuthQueryOptions,
  authQueryOptions
} from "../queries/auth-query-options"

type UseAuthQueryOptions<
  TFn extends AuthQueryFn,
  TPrefix extends QueryKey
> = Omit<AuthQueryOptions<TFn, TPrefix>, "queryKey" | "queryFn"> &
  Pick<NonNullable<Parameters<TFn>[0]>, "query" | "fetchOptions">

export function useAuthQuery<
  TFn extends AuthQueryFn,
  const TQueryKey extends QueryKey
>(
  authFn: TFn,
  queryKey: TQueryKey,
  options?: UseAuthQueryOptions<TFn, TQueryKey>
) {
  return createQuery(() => {
    const { query, fetchOptions, ...queryOptions } = options ?? {}

    return {
      ...authQueryOptions(authFn, queryKey, {
        query,
        fetchOptions
      } as Parameters<TFn>[0]),
      ...queryOptions
    }
  })
}
