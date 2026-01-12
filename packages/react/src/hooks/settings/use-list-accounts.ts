import { useAuth, useSession } from "@better-auth-ui/react"
import { type DefinedInitialDataOptions, useQuery } from "@tanstack/react-query"

/**
 * Fetches and returns the list of linked social accounts for the current user.
 *
 * @param options - Optional query options.
 * @returns Query result containing linked accounts data, loading state, and error state
 */
export function useListAccounts(options?: DefinedInitialDataOptions) {
  const { authClient, socialProviders } = useAuth()

  const { data: sessionData } = useSession(options)

  return useQuery({
    queryKey: ["auth", "listAccounts"],
    queryFn: () =>
      authClient.listAccounts({
        fetchOptions: { throw: true }
      }),
    enabled: !!socialProviders?.length && !!sessionData,
    ...(options as object)
  })
}
