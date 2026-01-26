import { type AuthClient, useAuth, useSession } from "@better-auth-ui/react"
import {
  type UseAuthQueryOptions,
  type UseAuthQueryResult,
  useAuthQuery
} from "../auth/use-auth-query"

/**
 * Retrieve device sessions for multi-session account switching.
 *
 * The query is enabled only when `multiSession` is true and session data is available.
 *
 * @param options - Optional React Query options to customize the query behavior.
 * @returns The React Query result for the device sessions list; `data` is the array of device session objects and includes loading and error states.
 */
export function useListDeviceSessions(
  options?: Partial<
    UseAuthQueryOptions<AuthClient["multiSession"]["listDeviceSessions"]>
  >
): UseAuthQueryResult<AuthClient["multiSession"]["listDeviceSessions"]> {
  const { authClient } = useAuth()
  const { data: sessionData } = useSession()

  return useAuthQuery({
    authFn: authClient.multiSession.listDeviceSessions,
    options: {
      queryKey: ["auth", "multiSession", "listDeviceSessions"],
      enabled: !!sessionData,
      ...options
    }
  })
}
