import {
  type OrganizationAuthClient,
  type RemoveMemberOptions,
  removeMemberOptions
} from "@better-auth-ui/core/plugins/organization"
import { type QueryClient, useMutation } from "@tanstack/react-query"
import { useSession } from "../../../../hooks/queries/use-session"

/**
 * React mutation hook for removing organization members.
 *
 * @param authClient - The Better Auth client.
 * @param options - Mutation options merged with the core mutation options.
 * @param queryClient - Optional React Query client override.
 */
export function useRemoveMember<TAuthClient extends OrganizationAuthClient>(
  authClient: TAuthClient,
  options?: RemoveMemberOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  const { data: session } = useSession(authClient, undefined, queryClient)
  const userId = session?.user.id

  return useMutation(
    {
      ...removeMemberOptions(authClient, userId),
      ...options
    },
    queryClient
  )
}
