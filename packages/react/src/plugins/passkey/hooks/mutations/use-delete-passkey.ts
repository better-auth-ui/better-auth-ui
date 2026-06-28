import {
  type DeletePasskeyOptions,
  deletePasskeyOptions,
  type PasskeyAuthClient
} from "@better-auth-ui/core/plugins/passkey"
import { type QueryClient, useMutation } from "@tanstack/react-query"
import { useSession } from "../../../../hooks/queries/use-session"

/**
 * Create a mutation for deleting a passkey.
 *
 * On success, `MutationInvalidator` awaits invalidation of the user's
 * passkey list (see `meta.awaits`).
 *
 * @param authClient - The Better Auth client with the passkey plugin.
 * @param options - React Query options forwarded to `useMutation`.
 */
export function useDeletePasskey<TAuthClient extends PasskeyAuthClient>(
  authClient: TAuthClient,
  options?: DeletePasskeyOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  const { data: session } = useSession(authClient, undefined, queryClient)
  const userId = session?.user.id

  return useMutation(
    {
      ...deletePasskeyOptions(authClient, userId),
      ...options
    },
    queryClient
  )
}
