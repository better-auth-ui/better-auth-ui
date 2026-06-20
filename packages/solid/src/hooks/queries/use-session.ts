import {
  type AuthClient,
  type SessionData,
  type SessionOptions,
  type SessionParams,
  sessionOptions
} from "@better-auth-ui/core"
import {
  createQuery,
  type QueryOptions,
  type UseQueryResult
} from "@tanstack/solid-query"
import type { BetterFetchError } from "better-auth/client"

export type UseSessionOptions<TAuthClient extends AuthClient> = Omit<
  QueryOptions<
    SessionData<TAuthClient>,
    BetterFetchError,
    SessionData<TAuthClient>
  >,
  "queryKey" | "queryFn"
> &
  SessionOptions<TAuthClient> &
  SessionParams<TAuthClient>

export function useSession<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options: UseSessionOptions<TAuthClient> = {}
): UseQueryResult<SessionData<TAuthClient>, BetterFetchError> {
  return createQuery(() => {
    const { query, fetchOptions, ...queryOptions } = options

    return {
      ...sessionOptions(authClient, { query, fetchOptions }),
      ...queryOptions
    } as never
  }) as UseQueryResult<SessionData<TAuthClient>, BetterFetchError>
}
