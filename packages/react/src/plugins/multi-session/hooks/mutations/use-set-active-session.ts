import {
  type MultiSessionAuthClient,
  type SetActiveSessionOptions,
  setActiveSessionOptions
} from "@better-auth-ui/core/plugins/multi-session"
import { type QueryClient, useMutation } from "@tanstack/react-query"
import { useSession } from "../../../../hooks/queries/use-session"

/**
 * Create a mutation for switching the active device session.
 *
 * On success, `MutationInvalidator` awaits invalidation of the session
 * and device sessions queries (see `meta.awaits`).
 *
 * @param authClient - The Better Auth client with the multi-session plugin.
 * @param options - React Query options forwarded to `useMutation`.
 */
export function useSetActiveSession<TAuthClient extends MultiSessionAuthClient>(
  authClient: TAuthClient,
  options?: SetActiveSessionOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  const { data: session } = useSession(authClient, undefined, queryClient)
  const userId = session?.user.id

  return useMutation(
    {
      ...setActiveSessionOptions(authClient, userId),
      ...options
    },
    queryClient
  )
}
