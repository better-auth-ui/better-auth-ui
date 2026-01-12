import { useAuth } from "@better-auth-ui/react"
import { type DefinedInitialDataOptions, useQuery } from "@tanstack/react-query"

/**
 * Retrieve the current authentication session.
 *
 * @param options - Options to merge into the React Query configuration for the session query.
 * @returns The React Query result for the session query: `data` contains session information, `isLoading`/`isFetching` indicate loading state, and `error` contains any fetch error.
 */
export function useSession(options?: Partial<DefinedInitialDataOptions>) {
  const { authClient } = useAuth()

  return useQuery({
    queryKey: ["auth", "session"],
    queryFn: () => authClient.getSession({ fetchOptions: { throw: true } }),
    ...(options as object)
  })
}