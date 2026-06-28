import {
  type CancelInvitationOptions,
  cancelInvitationOptions,
  type OrganizationAuthClient
} from "@better-auth-ui/core/plugins/organization"
import { type QueryClient, useMutation } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"
import { useSession } from "../../../../hooks/queries/use-session"

export type UseCancelInvitationOptions<
  TAuthClient extends OrganizationAuthClient
> = Accessor<CancelInvitationOptions<TAuthClient>>

export function useCancelInvitation<TAuthClient extends OrganizationAuthClient>(
  authClient: TAuthClient,
  options?: UseCancelInvitationOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  const session = useSession(authClient, undefined, queryClient)

  return useMutation(() => {
    const userId = session.data?.user.id

    return {
      ...cancelInvitationOptions(authClient, userId),
      ...(options?.() ?? {})
    }
  }, queryClient)
}
