import {
  type OrganizationAuthClient,
  type RemoveMemberOptions,
  removeMemberOptions
} from "@better-auth-ui/core/plugins/organization"
import { type QueryClient, useMutation } from "@tanstack/react-query"
import { useSession } from "../../../../hooks/queries/use-session"

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
