import {
  type InviteMemberOptions,
  inviteMemberOptions,
  type OrganizationAuthClient
} from "@better-auth-ui/core/plugins/organization"
import { type QueryClient, useMutation } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"
import { useSession } from "../../../../hooks/queries/use-session"
import { useActiveOrganization } from "../queries"

/**
 * Reactive mutation options accessor for `useInviteMember`.
 */
export type UseInviteMemberOptions<TAuthClient extends OrganizationAuthClient> =
  Accessor<InviteMemberOptions<TAuthClient>>

/**
 * Solid mutation hook for inviting organization members.
 *
 * @param authClient - The Better Auth client.
 * @param options - Reactive mutation options merged with the core mutation options.
 * @param queryClient - Optional Solid Query client accessor override.
 */
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
