import {
  type CancelInvitationOptions,
  cancelInvitationOptions,
  type OrganizationAuthClient
} from "@better-auth-ui/core/plugins/organization"
import { type QueryClient, useMutation } from "@tanstack/react-query"
import { useSession } from "../../../../hooks/queries/use-session"

/**
 * React mutation hook for canceling organization invitations.
 *
 * @param authClient - The Better Auth client.
 * @param options - Mutation options merged with the core mutation options.
 * @param queryClient - Optional React Query client override.
 */
export function useCancelInvitation<TAuthClient extends OrganizationAuthClient>(
  authClient: TAuthClient,
  options?: CancelInvitationOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  const { data: session } = useSession(authClient, undefined, queryClient)
  const userId = session?.user.id

  return useMutation(
    {
      ...cancelInvitationOptions(authClient, userId),
      ...options
    },
    queryClient
  )
}
