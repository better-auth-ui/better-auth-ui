import type { MutationOptions } from "@tanstack/query-core"
import type { BetterFetchError } from "better-auth/client"
import { generateOrganizationSlug } from "./generate-organization-slug"
import type { OrganizationAuthClient } from "./organization-auth-client"
import { organizationMutationKeys } from "./organization-mutation-keys"
import { organizationQueryKeys } from "./organization-query-keys"

export type CreateOrganizationParams<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Omit<Parameters<TAuthClient["organization"]["create"]>[0], "slug"> & {
  /** Omit to generate an available slug from the name. */
  slug?: string
}

export type CreateOrganizationOptions<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Omit<
  ReturnType<typeof createOrganizationOptions<TAuthClient>>,
  "mutationKey" | "mutationFn" | "meta"
>

/**
 * Mutation options factory for creating an organization.
 *
 * @param authClient - The Better Auth organization client.
 * @param userId - The current signed-in user's ID. Used for cache invalidation.
 */
export function createOrganizationOptions<
  TAuthClient extends OrganizationAuthClient
>(authClient: TAuthClient, userId?: string) {
  const mutationKey = organizationMutationKeys.create

  const mutationFn = async (params: CreateOrganizationParams<TAuthClient>) => {
    const generateSlug = params.slug === undefined
    const fetchOptions = {
      ...params.fetchOptions,
      throw: true as const
    }
    let slug = params.slug ?? generateOrganizationSlug(params.name)

    for (let attempt = 0; ; attempt++) {
      try {
        if (generateSlug) {
          await authClient.organization.checkSlug({ slug, fetchOptions })
        }

        return await authClient.organization.create<{ throw: true }>({
          ...params,
          slug,
          fetchOptions
        })
      } catch (error) {
        const code = (error as BetterFetchError | null)?.error?.code
        // Creation can race with a successful availability check.
        if (
          !generateSlug ||
          attempt >= 4 ||
          (code !== "ORGANIZATION_SLUG_ALREADY_TAKEN" &&
            code !== "ORGANIZATION_ALREADY_EXISTS")
        ) {
          throw error
        }

        slug = generateOrganizationSlug(params.name, crypto.randomUUID())
      }
    }
  }

  return {
    mutationKey,
    mutationFn,
    meta: {
      awaits: [organizationQueryKeys.lists(userId)],
      invalidates: [
        organizationQueryKeys.details(userId),
        organizationQueryKeys.fullDetails(userId),
        organizationQueryKeys.activeOrganizations(userId)
      ]
    }
  } as MutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    BetterFetchError,
    Parameters<typeof mutationFn>[0]
  >
}
