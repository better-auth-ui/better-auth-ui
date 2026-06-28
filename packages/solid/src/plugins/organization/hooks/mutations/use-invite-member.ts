import {
  type InviteMemberOptions,
  inviteMemberOptions,
  type OrganizationAuthClient
} from "@better-auth-ui/core/plugins/organization"
import { type QueryClient, useMutation } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"
import { useSession } from "../../../../hooks/queries/use-session"
import { useActiveOrganization } from "../queries"

export type UseInviteMemberOptions<TAuthClient extends OrganizationAuthClient> =
  Accessor<InviteMemberOptions<TAuthClient>>

export function useInviteMember<TAuthClient extends OrganizationAuthClient>(
  authClient: TAuthClient,
  options?: UseInviteMemberOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  const session = useSession(authClient, undefined, queryClient)
  const activeOrganization = useActiveOrganization(
    authClient,
    undefined,
    queryClient
  )

  return useMutation(() => {
    const userId = session.data?.user.id

    return {
      ...inviteMemberOptions(authClient, userId, activeOrganization.data?.id),
      ...(options?.() ?? {})
    }
  }, queryClient)
}
