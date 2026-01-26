import { type AuthClient, useAuth } from "@better-auth-ui/react"
import { type UseAuthQueryOptions, useAuthQuery } from "../auth/use-auth-query"

/**
 * Retrieve provider-specific account info for a given account ID.
 *
 * Uses the `accountInfo` API endpoint to fetch detailed information
 * from the social provider. The provider is automatically detected
 * from the account ID.
 *
 * @param accountId - The provider-given account ID to fetch info for
 * @param options - Optional react-query options forwarded to `useQuery`
 * @returns The react-query result containing account info data, loading state, and error state
 */
export function useAccountInfo(
  accountId?: string,
  options?: Partial<UseAuthQueryOptions<AuthClient["accountInfo"]>>
) {
  const { authClient } = useAuth()

  return useAuthQuery({
    authFn: authClient.accountInfo,
    params: { query: { accountId } },
    options: {
      queryKey: ["auth", "accountInfo", accountId],
      enabled: !!accountId,
      ...options
    }
  })
}
