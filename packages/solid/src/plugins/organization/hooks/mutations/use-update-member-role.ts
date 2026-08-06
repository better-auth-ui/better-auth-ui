import {
  type OrganizationAuthClient,
  type UpdateMemberRoleOptions,
  updateMemberRoleOptions
} from "@better-auth-ui/core/plugins/organization"
import { type QueryClient, useMutation } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"
import { useSession } from "../../../../hooks/queries/use-session"
import { useActiveOrganization } from "../queries"

/**
 * Reactive mutation options accessor for `useUpdateMemberRole`.
 */
export type UseUpdateMemberRoleOptions = Accessor<
  UpdateMemberRoleOptions<OrganizationAuthClient>
>

/**
 * Solid mutation hook for updating organization member roles.
 *
 * @param authClient - The Better Auth client.
 * @param options - Reactive mutation options merged with the core mutation options.
 * @param queryClient - Optional Solid Query client accessor override.
 */
export function useUpdateMemberRole(
  authClient: OrganizationAuthClient,
  options?: UseUpdateMemberRoleOptions,
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
      ...updateMemberRoleOptions(
        authClient,
        userId,
        activeOrganization.data?.id
      ),
      ...(options?.() ?? {})
    }
  }, queryClient)
}
