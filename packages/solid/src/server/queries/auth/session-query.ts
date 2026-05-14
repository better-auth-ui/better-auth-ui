import { authQueryKeys } from "@better-auth-ui/core"
import {
  type DataTag,
  type QueryClient,
  queryOptions
} from "@tanstack/solid-query"
import type { APIError } from "better-auth"

import type { AuthServer } from "../../../lib/auth-server"

export type SessionData<TAuth extends AuthServer = AuthServer> = Awaited<
  ReturnType<TAuth["api"]["getSession"]>
>

export type Session<TAuth extends AuthServer = AuthServer> = NonNullable<
  SessionData<TAuth>
>

export type SessionParams<TAuth extends AuthServer> = Parameters<
  TAuth["api"]["getSession"]
>[0]

export function sessionOptions<TAuth extends AuthServer>(
  auth: TAuth,
  params: SessionParams<TAuth>
) {
  type TData = SessionData<TAuth>
  const queryKey = authQueryKeys.session

  const options = queryOptions<TData, APIError, TData, typeof queryKey>({
    queryKey,
    queryFn: () => auth.api.getSession(params) as Promise<TData>
  })

  return options as typeof options & {
    queryKey: DataTag<typeof queryKey, TData, APIError>
  }
}

export const ensureSession = <TAuth extends AuthServer>(
  queryClient: QueryClient,
  auth: TAuth,
  params: SessionParams<TAuth>
) => queryClient.ensureQueryData(sessionOptions(auth, params) as never)

export const prefetchSession = <TAuth extends AuthServer>(
  queryClient: QueryClient,
  auth: TAuth,
  params: SessionParams<TAuth>
) => queryClient.prefetchQuery(sessionOptions(auth, params) as never)

export const fetchSession = <TAuth extends AuthServer>(
  queryClient: QueryClient,
  auth: TAuth,
  params: SessionParams<TAuth>
) => queryClient.fetchQuery(sessionOptions(auth, params) as never)
