import {
  type AuthClient,
  type SessionData,
  type SessionParams,
  sessionOptions
} from "@better-auth-ui/core"
import { type UseQueryOptions, useQuery } from "@tanstack/solid-query"
import type { BetterFetchError } from "better-auth/client"

export type UseSessionOptions<TAuthClient extends AuthClient> = Omit<
  UseQueryOptions<
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
) {
  const { query, fetchOptions, ...queryOptions } = options

  return useQuery(() => ({
    ...sessionOptions(authClient, { query, fetchOptions }),
    ...queryOptions
  }))
}
