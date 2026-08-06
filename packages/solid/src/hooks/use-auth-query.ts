import {
  type AuthQueryFn,
  type AuthQueryFnData,
  type AuthQueryKey,
  authQueryOptions
} from "@better-auth-ui/core"
import {
  type CreateQueryOptions,
  type DataTag,
  type QueryClient,
  type QueryKey,
  useQuery
} from "@tanstack/solid-query"
import type { BetterFetchError } from "better-auth/client"
import type { Accessor } from "solid-js"

type SolidAuthQueryOptions<
  TFn extends AuthQueryFn,
  TPrefix extends QueryKey
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

type UseAuthQueryOptions<
  TFn extends AuthQueryFn,
  TPrefix extends QueryKey
> = Omit<SolidAuthQueryOptions<TFn, TPrefix>, "queryKey" | "queryFn"> &
  Pick<NonNullable<Parameters<TFn>[0]>, "query" | "fetchOptions">

export function useAuthQuery<
  TFn extends AuthQueryFn,
  const TQueryKey extends QueryKey
>(
  authFn: TFn,
  queryKey: TQueryKey,
  options?: UseAuthQueryOptions<TFn, TQueryKey>,
  queryClient?: Accessor<QueryClient>
) {
  return useQuery(() => {
    const { query, fetchOptions, ...queryOptions } = options ?? {}

    return {
      ...(authQueryOptions(authFn, queryKey, {
        query,
        fetchOptions
      } as Parameters<TFn>[0]) as SolidAuthQueryOptions<TFn, TQueryKey>),
      ...queryOptions
    }
  }, queryClient)
}
