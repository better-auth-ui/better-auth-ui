import {
  type OrganizationAuthClient,
  type RejectInvitationOptions,
  rejectInvitationOptions
} from "@better-auth-ui/core/plugins/organization"
import { type QueryClient, useMutation } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"
import { useSession } from "../../../../hooks/queries/use-session"

export type UseRejectInvitationOptions<
  TAuthClient extends OrganizationAuthClient
> = Accessor<RejectInvitationOptions<TAuthClient>>

export function useRejectInvitation<TAuthClient extends OrganizationAuthClient>(
  authClient: TAuthClient,
  options?: UseRejectInvitationOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  const session = useSession(authClient, undefined, queryClient)

  return useMutation(() => {
    const userId = session.data?.user.id

    return {
      ...rejectInvitationOptions(authClient, userId),
      ...(options?.() ?? {})
    }
  }, queryClient)
}
