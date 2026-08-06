import {
  type AcceptInvitationOptions,
  acceptInvitationOptions,
  type OrganizationAuthClient
} from "@better-auth-ui/core/plugins/organization"
import { type QueryClient, useMutation } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"
import { useSession } from "../../../../hooks/queries/use-session"

/**
 * Reactive mutation options accessor for `useAcceptInvitation`.
 */
export type UseAcceptInvitationOptions<
  TAuthClient extends OrganizationAuthClient
> = Accessor<AcceptInvitationOptions<TAuthClient>>

/**
 * Solid mutation hook for accepting organization invitations.
 *
 * @param authClient - The Better Auth client.
 * @param options - Reactive mutation options merged with the core mutation options.
 * @param queryClient - Optional Solid Query client accessor override.
 */
export function useAcceptInvitation<TAuthClient extends OrganizationAuthClient>(
  authClient: TAuthClient,
  options?: UseAcceptInvitationOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  const session = useSession(authClient, undefined, queryClient)

  return useMutation(() => {
    const userId = session.data?.user.id

    return {
      ...acceptInvitationOptions(authClient, userId),
      ...(options?.() ?? {})
    }
  }, queryClient)
}
