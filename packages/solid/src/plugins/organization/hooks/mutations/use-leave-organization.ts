import {
  type LeaveOrganizationOptions,
  leaveOrganizationOptions,
  type OrganizationAuthClient
} from "@better-auth-ui/core/plugins/organization"
import { type QueryClient, useMutation } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"
import { useSession } from "../../../../hooks/queries/use-session"

export type UseLeaveOrganizationOptions<
  TAuthClient extends OrganizationAuthClient
> = Accessor<LeaveOrganizationOptions<TAuthClient>>

export function useLeaveOrganization<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
>(
  authClient: TAuthClient,
  options?: UseLeaveOrganizationOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  const session = useSession(authClient, undefined, queryClient)

  return useMutation(() => {
    const userId = session.data?.user.id

    return {
      ...leaveOrganizationOptions(authClient, userId),
      ...(options?.() ?? {})
    }
  }, queryClient)
}
