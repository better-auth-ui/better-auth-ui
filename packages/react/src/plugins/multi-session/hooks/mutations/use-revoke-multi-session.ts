import {
  type MultiSessionAuthClient,
  type RevokeMultiSessionOptions,
  revokeMultiSessionOptions
} from "@better-auth-ui/core/plugins/multi-session"
import { type QueryClient, useMutation } from "@tanstack/react-query"
import { useSession } from "../../../../hooks/queries/use-session"

/**
 * Create a mutation for revoking a device session in multi-session mode.
 *
 * On success, `MutationInvalidator` awaits invalidation of the device
 * sessions list (see `meta.awaits`).
 *
 * @param authClient - The Better Auth client with the multi-session plugin.
 * @param options - React Query options forwarded to `useMutation`.
 */
export function useRevokeMultiSession<
  TAuthClient extends MultiSessionAuthClient
>(
  authClient: TAuthClient,
  options?: RevokeMultiSessionOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  const { data: session } = useSession(authClient, undefined, queryClient)
  const userId = session?.user.id

  return useMutation(
    {
      ...revokeMultiSessionOptions(authClient, userId),
      ...options
    },
    queryClient
  )
}
