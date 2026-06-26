import {
  type AuthClient,
  type ListAccountsOptions,
  type ListAccountsParams,
  listAccountsOptions
} from "@better-auth-ui/core"
import { useQuery } from "@tanstack/solid-query"
import { getSessionUserId } from "../../queries/create-user-scoped-query"
import { useSession } from "./use-session"

export type UseListAccountsOptions<TAuthClient extends AuthClient> = Omit<
  ListAccountsOptions<TAuthClient>,
  "initialData"
> &
  ListAccountsParams<TAuthClient> & {
    enabled?: boolean | ((query: never) => boolean)
  }

export function useListAccounts<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options: UseListAccountsOptions<TAuthClient> = {}
) {
  const session = useSession(authClient)
  const userId = () => getSessionUserId(session)
  const { query, fetchOptions, enabled, ...queryOptions } = options

  return useQuery(() => {
    const baseOptions = listAccountsOptions(authClient, userId(), {
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
