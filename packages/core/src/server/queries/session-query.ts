import type { FetchQueryOptions } from "@tanstack/query-core"
import type { APIError } from "better-auth"
import { authQueryKeys } from "../../lib/auth-query-keys"
import type { AuthServer } from "../auth-server"

export type SessionAuthServer = Pick<AuthServer, "api"> & {
  api: Pick<AuthServer["api"], "getSession">
}

export type SessionData<TAuth extends SessionAuthServer = AuthServer> = Awaited<
  ReturnType<TAuth["api"]["getSession"]>
>

export type Session<TAuth extends SessionAuthServer = AuthServer> = NonNullable<
  SessionData<TAuth>
>

export type SessionParams<TAuth extends SessionAuthServer> = Parameters<
  TAuth["api"]["getSession"]
>[0]

export function sessionOptionsServer<TAuth extends SessionAuthServer>(
  auth: TAuth,
  params: SessionParams<TAuth>
): FetchQueryOptions<
  SessionData<TAuth>,
  APIError,
  SessionData<TAuth>,
  typeof authQueryKeys.session
> {
  return {
    queryKey: authQueryKeys.session,
    queryFn: () => auth.api.getSession(params) as Promise<SessionData<TAuth>>,
    meta: {
      package: "@better-auth-ui/core",
      runtime: "server",
      name: "session"
    }
  }
}

export const ensureSessionServer = <TAuth extends SessionAuthServer>(
  queryClient: {
    ensureQueryData: (
      options: ReturnType<typeof sessionOptionsServer<TAuth>>
    ) => Promise<SessionData<TAuth>>
  },
  auth: TAuth,
  params: SessionParams<TAuth>
) => queryClient.ensureQueryData(sessionOptionsServer(auth, params))

export const prefetchSessionServer = <TAuth extends SessionAuthServer>(
  queryClient: {
    prefetchQuery: (
      options: ReturnType<typeof sessionOptionsServer<TAuth>>
    ) => Promise<void>
  },
  auth: TAuth,
  params: SessionParams<TAuth>
) => queryClient.prefetchQuery(sessionOptionsServer(auth, params))

export const fetchSessionServer = <TAuth extends SessionAuthServer>(
  queryClient: {
    fetchQuery: (
      options: ReturnType<typeof sessionOptionsServer<TAuth>>
    ) => Promise<SessionData<TAuth>>
  },
  auth: TAuth,
  params: SessionParams<TAuth>
) => queryClient.fetchQuery(sessionOptionsServer(auth, params))
