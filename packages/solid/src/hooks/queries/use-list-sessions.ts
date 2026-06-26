import {
  type AuthClient,
  type ListSessionsData,
  type ListSessionsOptions,
  type ListSessionsParams,
  listSessionsOptions
} from "@better-auth-ui/core"
import { createQuery } from "@tanstack/solid-query"
import { getSessionUserId } from "../../queries/create-user-scoped-query"
import { useSession } from "./use-session"

export type UseListSessionsOptions<TAuthClient extends AuthClient> =
  ListSessionsOptions<TAuthClient> &
    ListSessionsParams<TAuthClient> & {
      enabled?: boolean | ((query: never) => boolean)
    }

export function useListSessions<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options: UseListSessionsOptions<TAuthClient> = {}
) {
  const session = useSession(authClient)
  const userId = () => getSessionUserId(session)
  const { query, fetchOptions, initialData, enabled, ...queryOptions } = options

  if (initialData !== undefined) {
    return createQuery(() => {
      const baseOptions = listSessionsOptions(authClient, userId(), {
        query,
        fetchOptions
      })

      return {
        ...queryOptions,
        ...baseOptions,
        enabled: (query) =>
          Boolean(userId()) &&
          (typeof enabled === "function"
            ? enabled(query as never)
            : enabled !== false),
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
      enabled: (query) =>
        Boolean(userId()) &&
        (typeof enabled === "function"
          ? enabled(query as never)
          : enabled !== false),
      initialData: undefined
    }
  })
}
