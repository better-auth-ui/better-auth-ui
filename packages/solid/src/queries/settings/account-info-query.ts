import {
  type AccountInfoData,
  type AccountInfoOptions,
  type AccountInfoParams,
  type AuthClient,
  accountInfoOptions
} from "@better-auth-ui/core"
import { createQuery, skipToken } from "@tanstack/solid-query"
import { useSession } from "../../hooks/queries/use-session"
import { getSessionUserId } from "../create-user-scoped-query"

export type UseAccountInfoOptions<TAuthClient extends AuthClient> =
  AccountInfoOptions<TAuthClient> &
    AccountInfoParams<TAuthClient> & {
      enabled?: boolean
    }

export function useAccountInfo<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options: UseAccountInfoOptions<TAuthClient> = {}
) {
  const session = useSession(authClient)
  const userId = () => getSessionUserId(session)
  const { query, fetchOptions, initialData, ...queryOptions } = options

  if (initialData !== undefined) {
    return createQuery(() => {
      const baseOptions = accountInfoOptions(authClient, userId(), {
        query,
        fetchOptions
      })
      const canFetch = Boolean(userId() && query?.accountId)

      return {
        ...queryOptions,
        ...baseOptions,
        queryFn: canFetch ? baseOptions.queryFn : skipToken,
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
    const canFetch = Boolean(userId() && query?.accountId)

    return {
      ...queryOptions,
      ...baseOptions,
      queryFn: canFetch ? baseOptions.queryFn : skipToken,
      initialData: undefined
    }
  })
}
