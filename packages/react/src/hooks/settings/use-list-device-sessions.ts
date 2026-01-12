import { useAuth, useSession } from "@better-auth-ui/react"
import { type DefinedInitialDataOptions, useQuery } from "@tanstack/react-query"

/**
 * Retrieve device sessions for multi-session account switching.
 *
 * The query is enabled only when `multiSession` is true and session data is available.
 *
 * @param options - Optional React Query options to customize the query behavior.
 * @returns The React Query result for the device sessions list; `data` is the array of device session objects and includes loading and error states.
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
