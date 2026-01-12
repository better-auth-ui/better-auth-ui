import { useAuth, useSession } from "@better-auth-ui/react"
import { type DefinedInitialDataOptions, useQuery } from "@tanstack/react-query"

/**
 * Fetches and returns the list of device sessions for multi-session support.
 *
 * @param options - Optional query options.
 * @returns Query result containing device sessions data, loading state, and error state
 */
export function useListDeviceSessions(options?: DefinedInitialDataOptions) {
  const { authClient, multiSession } = useAuth()
  const { data: sessionData } = useSession(options)

  return useQuery({
    queryKey: ["auth", "multiSession", "listDeviceSessions"],
    queryFn: async () =>
      authClient.multiSession.listDeviceSessions({
        fetchOptions: { throw: true }
      }),
    enabled: multiSession && !!sessionData,
    ...(options as object)
  })
}
