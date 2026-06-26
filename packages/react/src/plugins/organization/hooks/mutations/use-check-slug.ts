import { organizationMutationKeys } from "@better-auth-ui/core/plugins/organization"
import { mutationOptions, useMutation } from "@tanstack/react-query"
import type { BetterFetchError } from "better-auth/react"

import type { OrganizationAuthClient } from "../../organization-auth-client"

export type CheckSlugParams<TAuthClient extends OrganizationAuthClient> =
  Parameters<TAuthClient["organization"]["checkSlug"]>[0]

export type CheckSlugOptions<TAuthClient extends OrganizationAuthClient> = Omit<
  ReturnType<typeof checkSlugOptions<TAuthClient>>,
  "mutationKey" | "mutationFn"
>

/**
 * Mutation options factory for checking organization slug availability.
 *
 * @param authClient - The Better Auth client.
 */
export function checkSlugOptions<TAuthClient extends OrganizationAuthClient>(
  authClient: TAuthClient
) {
  const mutationKey = organizationMutationKeys.checkSlug

  const mutationFn = (params: CheckSlugParams<TAuthClient>) =>
    authClient.organization.checkSlug({
      ...params,
      fetchOptions: { ...params?.fetchOptions, throw: true }
    })

  return mutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    BetterFetchError,
    Parameters<typeof mutationFn>[0]
  >({
    mutationKey,
    mutationFn
  })
}

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
