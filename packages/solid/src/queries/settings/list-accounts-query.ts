import {
  type AuthClient,
  type ListAccountsOptions,
  type ListAccountsParams,
  listAccountsOptions
} from "@better-auth-ui/core"
import { type QueryClient, skipToken, useQuery } from "@tanstack/solid-query"
import { useSession } from "../../hooks/queries/use-session"
import { getSessionUserId } from "../create-user-scoped-query"

export type { ListAccountsParams } from "@better-auth-ui/core"

export const ensureListAccounts = <TAuthClient extends AuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string,
  params?: ListAccountsParams<TAuthClient>
) =>
  queryClient.ensureQueryData(listAccountsOptions(authClient, userId, params))

export const prefetchListAccounts = <TAuthClient extends AuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string,
  params?: ListAccountsParams<TAuthClient>
) => queryClient.prefetchQuery(listAccountsOptions(authClient, userId, params))

export const fetchListAccounts = <TAuthClient extends AuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string,
  params?: ListAccountsParams<TAuthClient>
) => queryClient.fetchQuery(listAccountsOptions(authClient, userId, params))

export type UseListAccountsOptions<TAuthClient extends AuthClient> = Omit<
  ListAccountsOptions<TAuthClient>,
  "initialData"
> &
  ListAccountsParams<TAuthClient>

export function useListAccounts<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options: UseListAccountsOptions<TAuthClient> = {}
) {
  const session = useSession(authClient)
  const userId = () => getSessionUserId(session)
  const { query, fetchOptions, ...queryOptions } = options

  return useQuery(() => {
    const baseOptions = listAccountsOptions(authClient, userId(), {
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
