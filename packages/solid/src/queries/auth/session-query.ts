import { authQueryKeys } from "@better-auth-ui/core"
import {
  createQuery,
  type DataTag,
  type QueryClient,
  queryOptions
} from "@tanstack/solid-query"
import type { BetterFetchError } from "better-auth/client"
import type { AuthClient, InferData } from "../../lib/auth-client"

export type SessionData<TAuthClient extends AuthClient = AuthClient> =
  InferData<TAuthClient["getSession"]>

export type Session<TAuthClient extends AuthClient = AuthClient> = NonNullable<
  SessionData<TAuthClient>
>

export type SessionParams<TAuthClient extends AuthClient> = Parameters<
  TAuthClient["getSession"]
>[0]

export type SessionOptions<TAuthClient extends AuthClient> = Omit<
  ReturnType<typeof sessionOptions<TAuthClient>>,
  "queryKey" | "queryFn"
>

export function sessionOptions<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  params?: SessionParams<TAuthClient>
) {
  type TData = SessionData<TAuthClient>
  const queryKey = authQueryKeys.session

  const options = queryOptions<TData, BetterFetchError>({
    queryKey,
    queryFn: ({ signal }) =>
      authClient.getSession({
        ...params,
        fetchOptions: { ...params?.fetchOptions, signal, throw: true }
      }) as Promise<TData>
  })

  return options as typeof options & {
    queryKey: DataTag<typeof queryKey, TData, BetterFetchError>
  }
}

export const ensureSession = <TAuthClient extends AuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  params?: SessionParams<TAuthClient>
) => queryClient.ensureQueryData(sessionOptions(authClient, params) as never)

export const prefetchSession = <TAuthClient extends AuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  params?: SessionParams<TAuthClient>
) => queryClient.prefetchQuery(sessionOptions(authClient, params) as never)

export const fetchSession = <TAuthClient extends AuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  params?: SessionParams<TAuthClient>
) => queryClient.fetchQuery(sessionOptions(authClient, params) as never)

export type UseSessionOptions<TAuthClient extends AuthClient> =
  SessionOptions<TAuthClient> & SessionParams<TAuthClient>

export function useSession<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options: UseSessionOptions<TAuthClient> = {}
) {
  return createQuery(() => {
    const { query, fetchOptions, ...queryOptions } = options

    return {
      ...sessionOptions(authClient, { query, fetchOptions }),
      ...queryOptions
    }
  })
}
