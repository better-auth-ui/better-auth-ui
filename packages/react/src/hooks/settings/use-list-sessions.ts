import { useAuth, useSession } from "@better-auth-ui/react"
import { type DefinedInitialDataOptions, useQuery } from "@tanstack/react-query"

/**
 * Fetches and returns the list of all active sessions for the current user.
 * These sessions represent all devices where the user is currently signed in.
 *
 * @param options - Optional query options.
 * @returns Query result containing sessions data, loading state, and error state
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
