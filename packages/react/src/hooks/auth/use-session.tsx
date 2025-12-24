import type { AnyAuthConfig } from "@better-auth-ui/react"
import { type DefinedInitialDataOptions, useQuery } from "@tanstack/react-query"

import { useAuth } from "../auth/use-auth"

/**
 * Fetches and returns the session data.
 *
 * @param config - Optional partial AuthConfig used to customize auth behavior; may include an `authClient` override.
 * @param options - Optional query options.
 * @returns Query result containing session data, loading state, and error state
 */
export function useSession(
  config?: AnyAuthConfig,
  options?: Partial<DefinedInitialDataOptions>
) {
  const { authClient, queryClient } = useAuth(config)

  return useQuery(
    {
      queryKey: ["auth", "session"],
      queryFn: () => authClient.getSession({ fetchOptions: { throw: true } }),
      ...(options as object)
    },
    queryClient
  )
}
