import { type AuthClient, useAuth, useSession } from "@better-auth-ui/react"
import { type UseAuthQueryOptions, useAuthQuery } from "../auth/use-auth-query"

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
  options?: UseAuthQueryOptions<AuthClient["listAccounts"]>
) {
  const { authClient } = useAuth()
  const { data: sessionData } = useSession()

  return useAuthQuery({
    authFn: authClient.listAccounts,
    options: {
      queryKey: ["auth", "listAccounts", sessionData?.user.id],
      enabled: !!sessionData,
      ...options
    }
  })
}
