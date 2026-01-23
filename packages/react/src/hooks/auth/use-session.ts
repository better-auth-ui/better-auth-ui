import { type SessionData, useAuth } from "@better-auth-ui/react"
import {
  type UseQueryOptions,
  type UseQueryResult,
  useQuery
} from "@tanstack/react-query"

/**
 * Retrieve the current authentication session.
 *
 * @param options - Options to merge into the React Query configuration for the session query.
 * @returns The React Query result for the session query: `data` contains session information, `isLoading`/`isFetching` indicate loading state, and `error` contains any fetch error.
 */
export function useSession(
  options?: Partial<UseQueryOptions>
): UseQueryResult<SessionData> {
  const { authClient } = useAuth()

  return useQuery({
    queryKey: ["auth", "session"],
    queryFn: async () =>
      (await authClient.getSession({
        fetchOptions: { throw: true }
      })) as SessionData,
    ...(options as object)
  })
}
