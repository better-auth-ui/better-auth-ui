import type { AnyAuthClient, AnyAuthConfig } from "@better-auth-ui/react"
import { useQuery } from "@tanstack/react-query"
import { useAuth } from "./use-auth"

/**
 * Fetches and returns the list of device sessions for multi-session support.
 *
 * @param config - Optional partial AuthConfig used to customize auth behavior; may include an `authClient` override.
 * @returns Query result containing device sessions data, loading state, and error state
 */
export function useListDeviceSessions<TAuthClient extends AnyAuthClient>(
  config?: AnyAuthConfig & { authClient?: TAuthClient }
) {
  const { authClient, multiSession, queryClient } = useAuth(config)

  const { data: sessionData } = authClient.useSession()

  return useQuery(
    {
      queryKey: ["auth", "multiSession", "listDeviceSessions"],
      queryFn: async () =>
        authClient.multiSession.listDeviceSessions({
          fetchOptions: { throw: true }
        }),
      enabled: !!multiSession && !!sessionData
    },
    queryClient
  )
}
