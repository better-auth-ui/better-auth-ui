import {
  type AccountInfoData,
  type AccountInfoOptions,
  type AccountInfoParams,
  type AuthClient,
  accountInfoOptions
} from "@better-auth-ui/core"
import { createQuery } from "@tanstack/solid-query"
import { getSessionUserId } from "../../queries/create-user-scoped-query"
import { useSession } from "./use-session"

export type UseAccountInfoOptions<TAuthClient extends AuthClient> =
  AccountInfoOptions<TAuthClient> &
    AccountInfoParams<TAuthClient> & {
      enabled?: boolean | ((query: never) => boolean)
    }

export function useAccountInfo<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options: UseAccountInfoOptions<TAuthClient> = {}
) {
  const session = useSession(authClient)
  const userId = () => getSessionUserId(session)
  const { query, fetchOptions, initialData, enabled, ...queryOptions } = options

  if (initialData !== undefined) {
    return createQuery(() => {
      const baseOptions = accountInfoOptions(authClient, userId(), {
        query,
        fetchOptions
      })

      return {
        ...queryOptions,
        ...baseOptions,
        enabled: (queryState) =>
          Boolean(userId() && query?.accountId) &&
          (typeof enabled === "function"
            ? enabled(queryState as never)
            : enabled !== false),
        initialData: initialData as
          | AccountInfoData<TAuthClient>
          | (() => AccountInfoData<TAuthClient>)
      }
    })
  }

  return createQuery(() => {
    const baseOptions = accountInfoOptions(authClient, userId(), {
      query,
      fetchOptions
    })

    return {
      ...queryOptions,
      ...baseOptions,
      enabled: (queryState) =>
        Boolean(userId() && query?.accountId) &&
        (typeof enabled === "function"
          ? enabled(queryState as never)
          : enabled !== false),
      initialData: undefined
    }
  })
}
