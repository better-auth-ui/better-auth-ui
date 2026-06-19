import type { AuthClient } from "../../lib/auth-client"
import { type UseSessionOptions, useSession } from "../queries/use-session"

/**
 * Retrieve the current authenticated user. Thin wrapper over `useSession`
 * that returns `session.user` as `data`.
 *
 * @param authClient - The Better Auth client.
 * @param options - `getSession` params & `useQuery` options.
 */
export function useUser<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options?: UseSessionOptions<TAuthClient>
) {
  const { data, ...rest } = useSession(authClient, options)

  return {
    data: data?.user,
    ...rest
  }
}
