import {
  type CreateOrganizationOptions,
  createOrganizationOptions,
  type OrganizationAuthClient
} from "@better-auth-ui/core/plugins/organization"
import { type QueryClient, useMutation } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"
import { useSession } from "../../../../hooks/queries/use-session"

/**
 * Reactive mutation options accessor for `useCreateOrganization`.
 */
export type UseCreateOrganizationOptions<
  TAuthClient extends OrganizationAuthClient
> = Accessor<CreateOrganizationOptions<TAuthClient>>

/**
 * Solid mutation hook for creating organizations.
 *
 * @param authClient - The Better Auth client.
 * @param options - Reactive mutation options merged with the core mutation options.
 * @param queryClient - Optional Solid Query client accessor override.
 */
export function useCreateOrganization<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
>(
  authClient: TAuthClient,
  options?: UseCreateOrganizationOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  const session = useSession(authClient, undefined, queryClient)

  return useMutation(() => {
    const userId = session.data?.user.id

    return {
      ...createOrganizationOptions(authClient, userId),
      ...(options?.() ?? {})
    }
  }, queryClient)
}
