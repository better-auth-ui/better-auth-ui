import {
  type AuthClient,
  authQueryKeys,
  type RevokeSessionOptions,
  revokeSessionOptions
} from "@better-auth-ui/core"
import { type QueryClient, useMutation } from "@tanstack/react-query"
import { useSession } from "../../hooks/queries/use-session"

export type { RevokeSessionParams } from "@better-auth-ui/core"

/**
 * Create a mutation for revoking a user session.
 */
export function useRevokeSession<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options?: RevokeSessionOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  const { data: session } = useSession(authClient, undefined, queryClient)
  const userId = session?.user.id

  return useMutation(
    {
      ...revokeSessionOptions(authClient),
      ...options,
      meta: {
        awaits: [authQueryKeys.listSessions(userId)]
      }
    },
    queryClient
  )
}
