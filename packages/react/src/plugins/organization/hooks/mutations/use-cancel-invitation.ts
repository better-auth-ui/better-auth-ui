import {
  type CancelInvitationOptions,
  cancelInvitationOptions,
  type OrganizationAuthClient
} from "@better-auth-ui/core/plugins/organization"
import { type QueryClient, useMutation } from "@tanstack/react-query"
import { useSession } from "../../../../hooks/queries/use-session"

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
