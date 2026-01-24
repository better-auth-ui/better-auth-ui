import type { AuthError } from "@better-auth-ui/core"
import { useAuth } from "@better-auth-ui/react"
import { type UseQueryOptions, useQuery } from "@tanstack/react-query"
import type { OAuth2UserInfo } from "better-auth"

type AccountInfo = {
  user: OAuth2UserInfo
  // biome-ignore lint/suspicious/noExplicitAny: any
  data: Record<string, any>
}

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
  options?: Partial<UseQueryOptions<AccountInfo, AuthError>>
) {
  const { authClient } = useAuth()

  return useQuery<AccountInfo, AuthError>({
    queryKey: ["auth", "accountInfo", accountId],
    queryFn: () =>
      authClient.accountInfo({
        query: { accountId },
        fetchOptions: { throw: true }
      }),
    enabled: !!accountId,
    ...(options as object)
  })
}
