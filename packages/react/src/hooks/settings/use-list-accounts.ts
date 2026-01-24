import type { AuthError } from "@better-auth-ui/core"
import { useAuth, useSession } from "@better-auth-ui/react"
import { type UseQueryOptions, useQuery } from "@tanstack/react-query"
import type { Account } from "better-auth"

/**
 * Retrieve the current user's linked social accounts.
 *
 * The query runs only when at least one social provider is configured and a session exists.
 * The provided `options` are forwarded to both `useSession` and `useQuery`, allowing customization of initial data and query behavior.
 *
 * @param options - Optional react-query / initial-data options forwarded to `useSession` and `useQuery`
 * @returns The react-query result containing linked accounts data, loading state, and error state
 */
export function useListAccounts(
  options?: Partial<UseQueryOptions<Account[], AuthError>>
) {
  const { authClient, socialProviders } = useAuth()
  const { data: sessionData } = useSession()

  return useQuery<Account[], AuthError>({
    queryKey: ["auth", "listAccounts", sessionData?.user.id],
    queryFn: () =>
      authClient.listAccounts({
        fetchOptions: { throw: true }
      }),
    enabled: !!socialProviders?.length && !!sessionData,
    ...(options as object)
  })
}
