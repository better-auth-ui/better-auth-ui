import { useAuth } from "@better-auth-ui/react"
import { type DefinedInitialDataOptions, useQuery } from "@tanstack/react-query"

/**
 * Fetches and returns the session data.
 *
 * @param options - Optional query options.
 * @returns Query result containing session data, loading state, and error state
 */
export function useSession(options?: Partial<DefinedInitialDataOptions>) {
  const { authClient } = useAuth()

  return useQuery({
    queryKey: ["auth", "session"],
    queryFn: () => authClient.getSession({ fetchOptions: { throw: true } }),
    ...(options as object)
  })
}
