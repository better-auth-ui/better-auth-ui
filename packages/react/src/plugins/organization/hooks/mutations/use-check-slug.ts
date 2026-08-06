import {
  type CheckSlugOptions,
  checkSlugOptions,
  type OrganizationAuthClient
} from "@better-auth-ui/core/plugins/organization"
import { useMutation } from "@tanstack/react-query"

/**
 * Create a mutation for checking whether an organization slug is available.
 *
 * @param authClient - The Better Auth client with the organization plugin.
 * @param options - React Query options forwarded to `useMutation`.
 */
export function useCheckSlug<TAuthClient extends OrganizationAuthClient>(
  authClient: TAuthClient,
  options?: CheckSlugOptions<TAuthClient>
) {
  return useMutation({
    ...checkSlugOptions(authClient),
    ...options
  })
}
