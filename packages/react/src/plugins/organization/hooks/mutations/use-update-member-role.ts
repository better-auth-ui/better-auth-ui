import {
  type OrganizationAuthClient,
  type UpdateMemberRoleOptions,
  updateMemberRoleOptions
} from "@better-auth-ui/core/plugins/organization"
import { type QueryClient, useMutation } from "@tanstack/react-query"
import { useSession } from "../../../../hooks/queries/use-session"
import { useActiveOrganization } from "../queries"

export function useUpdateMemberRole(
  authClient: OrganizationAuthClient,
  options?: UpdateMemberRoleOptions<OrganizationAuthClient>,
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
      ...updateMemberRoleOptions(authClient, userId, activeOrganization?.id),
      ...options
    },
    queryClient
  )
}
