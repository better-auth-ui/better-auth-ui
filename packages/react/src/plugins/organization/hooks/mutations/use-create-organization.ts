import {
  type CreateOrganizationOptions,
  createOrganizationOptions,
  type OrganizationAuthClient
} from "@better-auth-ui/core/plugins/organization"
import { type QueryClient, useMutation } from "@tanstack/react-query"
import { useSession } from "../../../../hooks/queries/use-session"

export function useCreateOrganization<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
>(
  authClient: TAuthClient,
  options?: CreateOrganizationOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  const { data: session } = useSession(authClient, undefined, queryClient)
  const userId = session?.user.id

  return useMutation(
    {
      ...createOrganizationOptions(authClient, userId),
      ...options
    },
    queryClient
  )
}
