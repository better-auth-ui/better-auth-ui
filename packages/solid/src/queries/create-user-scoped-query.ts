import {
  createQuery,
  type DataTag,
  type QueryClient,
  type QueryKey,
  queryOptions,
  skipToken
} from "@tanstack/solid-query"
import type { BetterFetchError } from "better-auth/client"

// biome-ignore lint/suspicious/noExplicitAny: Better Auth client methods have intentionally variable generated params.
export type QueryMethod<TData = unknown> = (params?: any) => Promise<TData>

export type QueryParams<TMethod extends QueryMethod> = Parameters<TMethod>[0]
export type QueryData<TMethod extends QueryMethod> = Awaited<
  ReturnType<TMethod>
>

export function createUserScopedOptions<
  TMethod extends QueryMethod,
  const TQueryKey extends QueryKey
>(queryKey: TQueryKey, authFn: TMethod, params?: QueryParams<TMethod>) {
  type TData = QueryData<TMethod>

  const options = queryOptions<TData, BetterFetchError, TData, TQueryKey>({
    queryKey,
    queryFn: ({ signal }) =>
      authFn({
        ...(params ?? {}),
        fetchOptions: {
          ...(params as { fetchOptions?: Record<string, unknown> } | undefined)
            ?.fetchOptions,
          signal,
          throw: true
        }
      } as QueryParams<TMethod>) as Promise<TData>
  })

  return options as typeof options & {
    queryKey: DataTag<TQueryKey, TData, BetterFetchError>
  }
}

export const ensureUserScopedQuery = <
  TMethod extends QueryMethod,
  const TQueryKey extends QueryKey
>(
  queryClient: QueryClient,
  queryKey: TQueryKey,
  authFn: TMethod,
  params?: QueryParams<TMethod>
) =>
  queryClient.ensureQueryData(
    createUserScopedOptions(queryKey, authFn, params) as never
  )

export const prefetchUserScopedQuery = <
  TMethod extends QueryMethod,
  const TQueryKey extends QueryKey
>(
  queryClient: QueryClient,
  queryKey: TQueryKey,
  authFn: TMethod,
  params?: QueryParams<TMethod>
) =>
  queryClient.prefetchQuery(
    createUserScopedOptions(queryKey, authFn, params) as never
  )

export const fetchUserScopedQuery = <
  TMethod extends QueryMethod,
  const TQueryKey extends QueryKey
>(
  queryClient: QueryClient,
  queryKey: TQueryKey,
  authFn: TMethod,
  params?: QueryParams<TMethod>
) =>
  queryClient.fetchQuery(
    createUserScopedOptions(queryKey, authFn, params) as never
  )

export function createUserScopedQuery<
  TMethod extends QueryMethod,
  const TQueryKey extends QueryKey
>(
  queryKey: () => TQueryKey,
  authFn: TMethod,
  params: () => QueryParams<TMethod> | undefined,
  canFetch: () => boolean,
  queryOptionsRest: () => Record<string, unknown>
) {
  return createQuery(() => {
    const baseOptions = createUserScopedOptions(queryKey(), authFn, params())

    return {
      ...queryOptionsRest(),
      ...baseOptions,
      queryFn: canFetch() ? baseOptions.queryFn : skipToken
    }
  })
}

export const getSessionUserId = (session: { data?: SessionLike }) =>
  session.data?.user?.id

type SessionLike = { user?: { id?: string } } | null | undefined
