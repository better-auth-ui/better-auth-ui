import {
  type AuthClient,
  type SessionData,
  type SessionOptions,
  type SessionParams,
  sessionOptions
} from "@better-auth-ui/core"
import {
  createQuery,
  type QueryOptions as SolidQueryOptions
} from "@tanstack/solid-query"
import type { BetterFetchError } from "better-auth/client"

type SessionQueryKey<TAuthClient extends AuthClient> = ReturnType<
  typeof sessionOptions<TAuthClient>
>["queryKey"]

type SolidSessionOptions<TAuthClient extends AuthClient> = Omit<
  SolidQueryOptions<
    SessionData<TAuthClient>,
    BetterFetchError,
    SessionData<TAuthClient>,
    SessionQueryKey<TAuthClient>
  >,
  "queryKey" | "queryFn"
>

export type UseSessionOptions<TAuthClient extends AuthClient> =
  SolidSessionOptions<TAuthClient> &
    SessionOptions<TAuthClient> &
    SessionParams<TAuthClient>

export function useSession<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options: UseSessionOptions<TAuthClient> = {}
) {
  const { query, fetchOptions, initialData, ...queryOptions } = options
  const baseOptions = sessionOptions(authClient, { query, fetchOptions })

  if (initialData !== undefined) {
    return createQuery(() => ({
      ...baseOptions,
      ...queryOptions,
      initialData: initialData as
        | SessionData<TAuthClient>
        | (() => SessionData<TAuthClient>)
    }))
  }

  return createQuery(() => ({
    ...baseOptions,
    ...queryOptions,
    initialData: undefined
  }))
}
