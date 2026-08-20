import {
  type OrganizationAuthClient,
  type SetActiveTeamOptions,
  setActiveTeamOptions
} from "@better-auth-ui/core/plugins/organization"
import { type QueryClient, useMutation } from "@tanstack/react-query"
import { useSession } from "../../../../hooks/queries/use-session"

export function useSetActiveTeam<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
>(
  authClient: TAuthClient,
  options?: SetActiveTeamOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  const { data: session } = useSession(authClient, undefined, queryClient)

  return useMutation(
    { ...setActiveTeamOptions(authClient, session?.user.id), ...options },
    queryClient
  )
}
