import {
  type AcceptInvitationOptions,
  acceptInvitationOptions,
  type OrganizationAuthClient
} from "@better-auth-ui/core/plugins/organization"
import { type QueryClient, useMutation } from "@tanstack/react-query"
import { useSession } from "../../../../hooks/queries/use-session"

export function useAcceptInvitation<TAuthClient extends OrganizationAuthClient>(
  authClient: TAuthClient,
  options?: AcceptInvitationOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  const { data: session } = useSession(authClient, undefined, queryClient)
  const userId = session?.user.id

  return useMutation(
    {
      ...acceptInvitationOptions(authClient, userId),
      ...options
    },
    queryClient
  )
}
