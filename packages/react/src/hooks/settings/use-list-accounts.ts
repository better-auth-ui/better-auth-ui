import { type AnyAuthConfig, useSession } from "@better-auth-ui/react"
import { type DefinedInitialDataOptions, useQuery } from "@tanstack/react-query"
import { useAuth } from "../auth/use-auth"

/**
 * Fetches and returns the list of linked social accounts for the current user.
 *
 * @param config - Optional partial AuthConfig used to customize auth behavior; may include an `authClient` override.
 * @param options - Optional query options.
 * @returns Query result containing linked accounts data, loading state, and error state
 */
export function useListAccounts(
  config?: AnyAuthConfig,
  options?: DefinedInitialDataOptions
) {
  const { authClient, queryClient, socialProviders } = useAuth(config)
  const { data: sessionData } = useSession(config, options)

  return useQuery(
    {
      queryKey: ["auth", "listAccounts", sessionData?.session.id],
      queryFn: () =>
        authClient.listAccounts({
          fetchOptions: { throw: true }
        }),
      enabled: !!socialProviders?.length && !!sessionData,
      ...(options as object)
    },
    queryClient
  )
}
