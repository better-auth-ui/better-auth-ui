import {
  type DeleteOrganizationOptions,
  deleteOrganizationOptions,
  type OrganizationAuthClient
} from "@better-auth-ui/core/plugins/organization"
import { type QueryClient, useMutation } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"
import { useSession } from "../../../../hooks/queries/use-session"

export type UseDeleteOrganizationOptions<
  TAuthClient extends OrganizationAuthClient
> = Accessor<DeleteOrganizationOptions<TAuthClient>>

export function useDeleteOrganization<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
>(
  authClient: TAuthClient,
  options?: UseDeleteOrganizationOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  const session = useSession(authClient, undefined, queryClient)

  return useMutation(() => {
    const userId = session.data?.user.id

    return {
      ...deleteOrganizationOptions(authClient, userId),
      ...(options?.() ?? {})
    }
  }, queryClient)
}
