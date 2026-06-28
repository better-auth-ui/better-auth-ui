import {
  type LeaveOrganizationOptions,
  leaveOrganizationOptions,
  type OrganizationAuthClient
} from "@better-auth-ui/core/plugins/organization"
import { type QueryClient, useMutation } from "@tanstack/react-query"
import { useSession } from "../../../../hooks/queries/use-session"

export function useLeaveOrganization<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
>(
  authClient: TAuthClient,
  options?: LeaveOrganizationOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  const { data: session } = useSession(authClient, undefined, queryClient)
  const userId = session?.user.id

  return useMutation(
    {
      ...leaveOrganizationOptions(authClient, userId),
      ...options
    },
    queryClient
  )
}
