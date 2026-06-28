import {
  type OrganizationAuthClient,
  type UpdateOrganizationOptions,
  updateOrganizationOptions
} from "@better-auth-ui/core/plugins/organization"
import { type QueryClient, useMutation } from "@tanstack/react-query"
import { useSession } from "../../../../hooks/queries/use-session"
import { useActiveOrganization } from "../queries"

export function useUpdateOrganization<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
>(
  authClient: TAuthClient,
  options?: UpdateOrganizationOptions<TAuthClient>,
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
      ...updateOrganizationOptions(authClient, userId, activeOrganization?.id),
      ...options
    },
    queryClient
  )
}
