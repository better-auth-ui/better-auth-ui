import {
  type DeleteOrganizationOptions,
  deleteOrganizationOptions,
  type OrganizationAuthClient
} from "@better-auth-ui/core/plugins/organization"
import { type QueryClient, useMutation } from "@tanstack/react-query"
import { useSession } from "../../../../hooks/queries/use-session"

/**
 * React mutation hook for deleting organizations.
 *
 * @param authClient - The Better Auth client.
 * @param options - Mutation options merged with the core mutation options.
 * @param queryClient - Optional React Query client override.
 */
export function useDeleteOrganization<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
>(
  authClient: TAuthClient,
  options?: DeleteOrganizationOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  const { data: session } = useSession(authClient, undefined, queryClient)
  const userId = session?.user.id

  return useMutation(
    {
      ...deleteOrganizationOptions(authClient, userId),
      ...options
    },
    queryClient
  )
}
