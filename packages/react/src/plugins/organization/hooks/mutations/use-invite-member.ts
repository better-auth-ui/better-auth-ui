import {
  type InviteMemberOptions,
  inviteMemberOptions,
  type OrganizationAuthClient
} from "@better-auth-ui/core/plugins/organization"
import { type QueryClient, useMutation } from "@tanstack/react-query"
import { useSession } from "../../../../hooks/queries/use-session"
import { useActiveOrganization } from "../queries"

export function useInviteMember<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
>(
  authClient: TAuthClient,
  options?: InviteMemberOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  const { data: session } = useSession(authClient, undefined, queryClient)
  const userId = session?.user.id

  const { data: activeOrganization } = useActiveOrganization(
    authClient,
    undefined,
    queryClient
  )

  return useMutation(
    {
      ...inviteMemberOptions(authClient, userId, activeOrganization?.id),
      ...options
    },
    queryClient
  )
}
