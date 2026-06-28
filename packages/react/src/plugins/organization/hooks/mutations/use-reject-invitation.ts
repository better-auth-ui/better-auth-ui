import {
  type OrganizationAuthClient,
  type RejectInvitationOptions,
  rejectInvitationOptions
} from "@better-auth-ui/core/plugins/organization"
import { type QueryClient, useMutation } from "@tanstack/react-query"
import { useSession } from "../../../../hooks/queries/use-session"

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
