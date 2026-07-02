import {
  type OrganizationAuthClient,
  type UpdateOrganizationOptions,
  updateOrganizationOptions
} from "@better-auth-ui/core/plugins/organization"
import { type QueryClient, useMutation } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"
import { useSession } from "../../../../hooks/queries/use-session"
import { useActiveOrganization } from "../queries"

/**
 * Reactive mutation options accessor for `useUpdateOrganization`.
 */
export type UseUpdateOrganizationOptions<
  TAuthClient extends OrganizationAuthClient
> = Accessor<UpdateOrganizationOptions<TAuthClient>>

/**
 * Solid mutation hook for updating organizations.
 *
 * @param authClient - The Better Auth client.
 * @param options - Reactive mutation options merged with the core mutation options.
 * @param queryClient - Optional Solid Query client accessor override.
 */
export function useUpdateOrganization<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
>(
  authClient: TAuthClient,
  options?: UseUpdateOrganizationOptions<TAuthClient>,
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
      ...updateOrganizationOptions(
        authClient,
        userId,
        activeOrganization.data?.id
      ),
      ...(options?.() ?? {})
    }
  }, queryClient)
}
