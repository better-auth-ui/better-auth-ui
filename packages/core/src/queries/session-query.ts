import type { DataTag, FetchQueryOptions } from "@tanstack/query-core"
import type { BetterFetchError } from "better-auth/client"
import type { AuthClient, InferData } from "../lib/auth-client"
import { authQueryKeys } from "../lib/auth-query-keys"

export type SessionAuthClient = {
  getSession: AuthClient["getSession"]
}

export type SessionData<TAuthClient extends SessionAuthClient = AuthClient> =
  InferData<TAuthClient["getSession"]>

export type Session<TAuthClient extends SessionAuthClient = AuthClient> =
  NonNullable<SessionData<TAuthClient>>

export type SessionParams<TAuthClient extends SessionAuthClient> = Parameters<
  TAuthClient["getSession"]
>[0]

export type SessionOptions<TAuthClient extends SessionAuthClient> = Omit<
  ReturnType<typeof sessionOptions<TAuthClient>>,
  "queryKey" | "queryFn"
>

export function sessionOptions<TAuthClient extends SessionAuthClient>(
  authClient: TAuthClient,
  params?: SessionParams<TAuthClient>
): FetchQueryOptions<
  SessionData<TAuthClient>,
  BetterFetchError,
  SessionData<TAuthClient>,
  typeof authQueryKeys.session
> & {
  queryKey: DataTag<
    typeof authQueryKeys.session,
    SessionData<TAuthClient>,
    BetterFetchError
  >
} {
  return {
    queryKey: authQueryKeys.session,
    queryFn: ({ signal }) =>
      authClient.getSession({
        ...params,
        fetchOptions: { ...params?.fetchOptions, signal, throw: true }
      }) as Promise<SessionData<TAuthClient>>
  } as FetchQueryOptions<
    SessionData<TAuthClient>,
    BetterFetchError,
    SessionData<TAuthClient>,
    typeof authQueryKeys.session
  > & {
    queryKey: DataTag<
      typeof authQueryKeys.session,
      SessionData<TAuthClient>,
      BetterFetchError
    >
  }
}

export const ensureSession = <TAuthClient extends SessionAuthClient>(
  queryClient: {
    ensureQueryData: (
      options: ReturnType<typeof sessionOptions<TAuthClient>>
    ) => Promise<SessionData<TAuthClient>>
  },
  authClient: TAuthClient,
  params?: SessionParams<TAuthClient>
) => queryClient.ensureQueryData(sessionOptions(authClient, params))

export const prefetchSession = <TAuthClient extends SessionAuthClient>(
  queryClient: {
    prefetchQuery: (
      options: ReturnType<typeof sessionOptions<TAuthClient>>
    ) => Promise<void>
  },
  authClient: TAuthClient,
  params?: SessionParams<TAuthClient>
) => queryClient.prefetchQuery(sessionOptions(authClient, params))

export const fetchSession = <TAuthClient extends SessionAuthClient>(
  queryClient: {
    fetchQuery: (
      options: ReturnType<typeof sessionOptions<TAuthClient>>
    ) => Promise<SessionData<TAuthClient>>
  },
  authClient: TAuthClient,
  params?: SessionParams<TAuthClient>
) => queryClient.fetchQuery(sessionOptions(authClient, params))
