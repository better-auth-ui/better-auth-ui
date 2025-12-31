import { type AnyAuthConfig, useSession } from "@better-auth-ui/react"
import { type DefinedInitialDataOptions, useQuery } from "@tanstack/react-query"
import { useAuth } from "../auth/use-auth"

/**
 * Fetches and returns the list of all active sessions for the current user.
 * These sessions represent all devices where the user is currently signed in.
 *
 * @param config - Optional partial AuthConfig used to customize auth behavior; may include an `authClient` override.
 * @param options - Optional query options.
 * @returns Query result containing sessions data, loading state, and error state
 */
export function useListSessions(
  config?: AnyAuthConfig,
  options?: DefinedInitialDataOptions
) {
  const { authClient, queryClient } = useAuth(config)
  const { data: sessionData } = useSession(config, options)

  return useQuery(
    {
      queryKey: ["auth", "listSessions", sessionData?.session.id],
      queryFn: async () =>
        authClient.listSessions({
          fetchOptions: { throw: true }
        }),
      enabled: !!sessionData,
      ...(options as object)
    },
    queryClient
  )
}

