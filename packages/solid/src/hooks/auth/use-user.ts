import type { AuthClient } from "@better-auth-ui/core"
import type { QueryClient } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"
import { type UseSessionOptions, useSession } from "../queries/use-session"

/**
 * Retrieve the current authenticated user from the session query.
 *
 * @param authClient - The Better Auth client.
 * @param options - `getSession` params and Solid Query options.
 * @param queryClient - Optional Solid Query client accessor override.
 */
export function useUser<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options?: UseSessionOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  const session = useSession(authClient, options, queryClient)

  return {
    ...session,
    get data() {
      return session.data?.user
    }
  }
}
