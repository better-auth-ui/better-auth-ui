import {
  type OrganizationAuthClient,
  type UpdateMemberRoleOptions,
  updateMemberRoleOptions
} from "@better-auth-ui/core/plugins/organization"
import { type QueryClient, useMutation } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"
import { useSession } from "../../../../hooks/queries/use-session"
import { useActiveOrganization } from "../queries"

export type UseUpdateMemberRoleOptions = Accessor<
  UpdateMemberRoleOptions<OrganizationAuthClient>
>

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
