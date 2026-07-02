import {
  type OrganizationAuthClient,
  type RemoveMemberOptions,
  removeMemberOptions
} from "@better-auth-ui/core/plugins/organization"
import { type QueryClient, useMutation } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"
import { useSession } from "../../../../hooks/queries/use-session"

/**
 * Reactive mutation options accessor for `useRemoveMember`.
 */
export type UseRemoveMemberOptions<TAuthClient extends OrganizationAuthClient> =
  Accessor<RemoveMemberOptions<TAuthClient>>

/**
 * Solid mutation hook for removing organization members.
 *
 * @param authClient - The Better Auth client.
 * @param options - Reactive mutation options merged with the core mutation options.
 * @param queryClient - Optional Solid Query client accessor override.
 */
export function useRemoveMember<TAuthClient extends OrganizationAuthClient>(
  authClient: TAuthClient,
  options?: UseRemoveMemberOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  const session = useSession(authClient, undefined, queryClient)

  return useMutation(() => {
    const userId = session.data?.user.id

    return {
      ...removeMemberOptions(authClient, userId),
      ...(options?.() ?? {})
    }
  }, queryClient)
}
