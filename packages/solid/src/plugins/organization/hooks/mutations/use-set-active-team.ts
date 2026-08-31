import {
  type OrganizationTeamsAuthClient,
  type SetActiveTeamOptions,
  setActiveTeamOptions
} from "@better-auth-ui/core/plugins/organization"
import { type QueryClient, useMutation } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"
import { useSession } from "../../../../hooks/queries/use-session"

export type UseSetActiveTeamOptions<T extends OrganizationTeamsAuthClient> =
  Accessor<SetActiveTeamOptions<T>>

export function useSetActiveTeam<
  TAuthClient extends OrganizationTeamsAuthClient = OrganizationTeamsAuthClient
>(
  authClient: TAuthClient,
  options?: UseSetActiveTeamOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  const session = useSession(authClient, undefined, queryClient)

  return useMutation(
    () => ({
      ...setActiveTeamOptions(authClient, session.data?.user.id),
      ...options?.()
    }),
    queryClient
  )
}
