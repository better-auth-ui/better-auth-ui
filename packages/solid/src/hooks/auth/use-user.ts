import type { AuthClient } from "@better-auth-ui/core"
import { type UseSessionOptions, useSession } from "../queries/use-session"

/**
 * Retrieve the current authenticated user from the session query.
 *
 * @param authClient - The Better Auth client.
 * @param options - `getSession` params and Solid Query options.
 */
export function useUser<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options?: UseSessionOptions<TAuthClient>
) {
  const session = useSession(authClient, options)

  return {
    ...session,
    get data() {
      return session.data?.user
    }
  }
}
