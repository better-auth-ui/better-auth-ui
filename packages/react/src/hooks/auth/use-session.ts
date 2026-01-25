import { type AuthClient, useAuth } from "@better-auth-ui/react"
import {
  type UseQueryOptions,
  type UseQueryResult,
  useQuery
} from "@tanstack/react-query"
import type { BetterFetchError } from "better-auth/react"

/**
 * Retrieve the current authentication session.
 *
 * @param options - Options to merge into the React Query configuration for the session query.
 * @returns The React Query result for the session query: `data` contains session information, `isLoading`/`isFetching` indicate loading state, and `error` contains any fetch error.
 */
export function useSession(
  options?: Partial<
    UseQueryOptions<AuthClient["$Infer"]["Session"], BetterFetchError>
  >
): UseQueryResult<AuthClient["$Infer"]["Session"] | null, BetterFetchError> {
  const { authClient } = useAuth()

  return useQuery<AuthClient["$Infer"]["Session"] | null, BetterFetchError>({
    queryKey: ["auth", "getSession"],
    queryFn: () =>
      authClient.getSession({
        fetchOptions: { throw: true }
      }),
    ...(options as object)
  })
}
