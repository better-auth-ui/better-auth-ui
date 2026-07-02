import {
  type CancelInvitationOptions,
  cancelInvitationOptions,
  type OrganizationAuthClient
} from "@better-auth-ui/core/plugins/organization"
import { type QueryClient, useMutation } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"
import { useSession } from "../../../../hooks/queries/use-session"

/**
 * Reactive mutation options accessor for `useCancelInvitation`.
 */
export type UseCancelInvitationOptions<
  TAuthClient extends OrganizationAuthClient
> = Accessor<CancelInvitationOptions<TAuthClient>>

/**
 * Solid mutation hook for canceling organization invitations.
 *
 * @param authClient - The Better Auth client.
 * @param options - Reactive mutation options merged with the core mutation options.
 * @param queryClient - Optional Solid Query client accessor override.
 */
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
