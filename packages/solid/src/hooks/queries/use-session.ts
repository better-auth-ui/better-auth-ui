import { sessionOptions } from "@better-auth-ui/core"
import {
  createQuery,
  type QueryOptions,
  type UseQueryResult
} from "@tanstack/solid-query"
import type { BetterFetchError } from "better-auth/client"
import type { AuthClient, InferData } from "../../lib/auth-client"

export type SessionData<TAuthClient extends AuthClient = AuthClient> =
  InferData<TAuthClient["getSession"]>

export type SessionParams<TAuthClient extends AuthClient> = Parameters<
  TAuthClient["getSession"]
>[0]

export type UseSessionOptions<TAuthClient extends AuthClient> = Omit<
  QueryOptions<
    SessionData<TAuthClient>,
    BetterFetchError,
    SessionData<TAuthClient>
  >,
  "queryKey" | "queryFn"
> &
  SessionParams<TAuthClient>

export function useSession<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options: UseSessionOptions<TAuthClient> = {}
): UseQueryResult<SessionData<TAuthClient>, BetterFetchError> {
  return createQuery(() => {
    const { query, fetchOptions, ...queryOptions } = options

    return {
      ...sessionOptions(authClient as never, { query, fetchOptions } as never),
      ...queryOptions
    } as never
  }) as UseQueryResult<SessionData<TAuthClient>, BetterFetchError>
}
