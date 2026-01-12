import { useAuth, useSession } from "@better-auth-ui/react"
import { type DefinedInitialDataOptions, useQuery } from "@tanstack/react-query"

/**
 * Retrieve the active sessions (devices where the current user is signed in).
 *
 * The underlying query is enabled only when session data is available.
 *
 * @param options - Optional React Query options to customize the query behavior.
 * @returns The React Query result for the sessions list; `data` is the array of session objects, and the result includes loading and error states.
 */
export function useListSessions(options?: DefinedInitialDataOptions) {
  const { authClient } = useAuth()
  const { data: sessionData } = useSession(options)

  return useQuery({
    queryKey: ["auth", "listSessions"],
    queryFn: async () =>
      authClient.listSessions({
        fetchOptions: { throw: true }
      }),
    enabled: !!sessionData,
    ...(options as object)
  })
}
