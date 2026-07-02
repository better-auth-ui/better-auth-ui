import {
  type CheckSlugOptions,
  checkSlugOptions,
  type OrganizationAuthClient
} from "@better-auth-ui/core/plugins/organization"
import { type QueryClient, useMutation } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"

/**
 * Reactive mutation options accessor for `useCheckSlug`.
 */
export type UseCheckSlugOptions<TAuthClient extends OrganizationAuthClient> =
  Accessor<CheckSlugOptions<TAuthClient>>

/**
 * Solid mutation hook for checking organization slug availability.
 *
 * @param authClient - The Better Auth client.
 * @param options - Reactive mutation options merged with the core mutation options.
 * @param queryClient - Optional Solid Query client accessor override.
 */
export function useCheckSlug<TAuthClient extends OrganizationAuthClient>(
  authClient: TAuthClient,
  options?: UseCheckSlugOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  return useMutation(
    () => ({
      ...checkSlugOptions(authClient),
      ...(options?.() ?? {})
    }),
    queryClient
  )
}
