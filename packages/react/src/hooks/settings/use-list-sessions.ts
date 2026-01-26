import { type AuthClient, useAuth, useSession } from "@better-auth-ui/react"
import { type UseAuthQueryOptions, useAuthQuery } from "../auth/use-auth-query"

/**
 * Retrieve the active sessions (devices where the current user is signed in).
 *
 * The underlying query is enabled only when session data is available.
 *
 * @param options - Optional React Query options to customize the query behavior.
 * @returns The React Query result for the sessions list; `data` is the array of session objects, and the result includes loading and error states.
 */
export function useListSessions(
  options?: Partial<UseAuthQueryOptions<AuthClient["listSessions"]>>
) {
  const { authClient } = useAuth()
  const { data: sessionData } = useSession()

  return useAuthQuery({
    authFn: authClient.listSessions,
    options: {
      queryKey: ["auth", "listSessions", sessionData?.user.id],
      enabled: !!sessionData,
      ...options
    }
  })
}
