import type { AuthClient } from "@better-auth-ui/core"
import type { QueryClient } from "@tanstack/react-query"
import { type UseSessionOptions, useSession } from "../queries/use-session"

/**
 * Retrieve the current authenticated user. Thin wrapper over `useSession`
 * that returns `session.user` as `data`.
 *
 * @param authClient - The Better Auth client.
 * @param options - `getSession` params & `useQuery` options.
 * @param queryClient - Optional React Query client override.
 */
export function useUser<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options?: UseSessionOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  const { data, ...rest } = useSession(authClient, options, queryClient)

  return {
    data: data?.user,
    ...rest
  }
}
