import {
  type AuthClient,
  type ListSessionsData,
  type ListSessionsOptions,
  type ListSessionsParams,
  listSessionsOptions
} from "@better-auth-ui/core"
import { createQuery, type QueryClient, skipToken } from "@tanstack/solid-query"
import { useSession } from "../../hooks/queries/use-session"
import { getSessionUserId } from "../create-user-scoped-query"

export type { ListSessionsParams } from "@better-auth-ui/core"

export const ensureListSessions = <TAuthClient extends AuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string,
  params?: ListSessionsParams<TAuthClient>
) =>
  queryClient.ensureQueryData(listSessionsOptions(authClient, userId, params))

export const prefetchListSessions = <TAuthClient extends AuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string,
  params?: ListSessionsParams<TAuthClient>
) => queryClient.prefetchQuery(listSessionsOptions(authClient, userId, params))

export const fetchListSessions = <TAuthClient extends AuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string,
  params?: ListSessionsParams<TAuthClient>
) => queryClient.fetchQuery(listSessionsOptions(authClient, userId, params))

export type UseListSessionsOptions<TAuthClient extends AuthClient> =
  ListSessionsOptions<TAuthClient> & ListSessionsParams<TAuthClient>

export function useListSessions<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options: UseListSessionsOptions<TAuthClient> = {}
) {
  const session = useSession(authClient)
  const userId = () => getSessionUserId(session)
  const { query, fetchOptions, initialData, ...queryOptions } = options

  if (initialData !== undefined) {
    return createQuery(() => {
      const baseOptions = listSessionsOptions(authClient, userId(), {
        query,
        fetchOptions
      })

      return {
        ...queryOptions,
        ...baseOptions,
        queryFn: userId() ? baseOptions.queryFn : skipToken,
        initialData: initialData as
          | ListSessionsData<TAuthClient>
          | (() => ListSessionsData<TAuthClient>)
      }
    })
  }

  return createQuery(() => {
    const baseOptions = listSessionsOptions(authClient, userId(), {
      query,
      fetchOptions
    })

    return {
      ...queryOptions,
      ...baseOptions,
      queryFn: userId() ? baseOptions.queryFn : skipToken,
      initialData: undefined
    }
  })
}
