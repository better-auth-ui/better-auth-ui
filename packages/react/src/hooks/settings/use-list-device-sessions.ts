import { type AnyAuthConfig, useSession } from "@better-auth-ui/react"
import { type DefinedInitialDataOptions, useQuery } from "@tanstack/react-query"
import { useAuth } from "../auth/use-auth"

/**
 * Fetches and returns the list of device sessions for multi-session support.
 *
 * @param config - Optional partial AuthConfig used to customize auth behavior; may include an `authClient` override.
 * @param options - Optional query options.
 * @returns Query result containing device sessions data, loading state, and error state
 */
export function useListDeviceSessions(
  config?: AnyAuthConfig,
  options?: DefinedInitialDataOptions
) {
  const { authClient, multiSession, queryClient } = useAuth(config)
  const { data: sessionData } = useSession(config, options)

  return useQuery(
    {
      queryKey: ["auth", "multiSession", "listDeviceSessions"],
      queryFn: async () =>
        authClient.multiSession.listDeviceSessions({
          fetchOptions: { throw: true }
        }),
      enabled: multiSession && !!sessionData,
      ...(options as object)
    },
    queryClient
  )
}
