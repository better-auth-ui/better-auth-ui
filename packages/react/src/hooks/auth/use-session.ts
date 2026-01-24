import type { AuthError } from "@better-auth-ui/core"
import { type AuthClient, useAuth } from "@better-auth-ui/react"
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
  options?: Partial<UseQueryOptions<AuthClient["$Infer"]["Session"], AuthError>>
): UseQueryResult<AuthClient["$Infer"]["Session"] | null, AuthError> {
  const { authClient } = useAuth()

  return useQuery<AuthClient["$Infer"]["Session"] | null, AuthError>({
    queryKey: ["auth", "getSession"],
    queryFn: () =>
      authClient.getSession({
        fetchOptions: { throw: true }
      }),
    ...(options as object)
  })
}
