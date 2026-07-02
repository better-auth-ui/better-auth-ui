import {
  type OrganizationAuthClient,
  type RejectInvitationOptions,
  rejectInvitationOptions
} from "@better-auth-ui/core/plugins/organization"
import { type QueryClient, useMutation } from "@tanstack/react-query"
import { useSession } from "../../../../hooks/queries/use-session"

/**
 * React mutation hook for rejecting organization invitations.
 *
 * @param authClient - The Better Auth client.
 * @param options - Mutation options merged with the core mutation options.
 * @param queryClient - Optional React Query client override.
 */
export function useRejectInvitation<TAuthClient extends OrganizationAuthClient>(
  authClient: TAuthClient,
  options?: RejectInvitationOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  const { data: session } = useSession(authClient, undefined, queryClient)
  const userId = session?.user.id

  return useMutation(
    {
      ...rejectInvitationOptions(authClient, userId),
      ...options
    },
    queryClient
  )
}
