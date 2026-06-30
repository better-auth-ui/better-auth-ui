import type { MutationOptions } from "@tanstack/query-core"
import type { BetterFetchError } from "better-auth/client"
import type { OrganizationAuthClient } from "./organization-auth-client"
import { organizationMutationKeys } from "./organization-mutation-keys"

export type CheckSlugFn<TAuthClient extends OrganizationAuthClient> =
  TAuthClient["organization"]["checkSlug"]

export type CheckSlugParams<TAuthClient extends OrganizationAuthClient> =
  Parameters<CheckSlugFn<TAuthClient>>[0]

export type CheckSlugOptions<TAuthClient extends OrganizationAuthClient> = Omit<
  ReturnType<typeof checkSlugOptions<TAuthClient>>,
  "mutationKey" | "mutationFn"
>

/**
 * Mutation options factory for checking organization slug availability.
 *
 * @param authClient - The Better Auth organization client.
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

  return {
    mutationKey,
    mutationFn
  } as MutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    BetterFetchError,
    Parameters<typeof mutationFn>[0]
  >
}
