import { type AuthClient, useAuth } from "@better-auth-ui/react"
import {
  type UseAuthQueryOptions,
  type UseAuthQueryResult,
  useAuthQuery
} from "./use-auth-query"

/**
 * Retrieve the current authentication session.
 *
 * @param options - Options to merge into the React Query configuration for the session query.
 * @returns The React Query result for the session query: `data` contains session information, `isLoading`/`isFetching` indicate loading state, and `error` contains any fetch error.
 */
export function useSession(
  options?: Partial<UseAuthQueryOptions<AuthClient["getSession"]>>
): UseAuthQueryResult<AuthClient["getSession"]> {
  const { authClient } = useAuth()

  return useAuthQuery({
    authFn: authClient.getSession,
    options: {
      queryKey: ["auth", "getSession"],
      ...options
    }
  })
}
