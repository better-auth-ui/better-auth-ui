import type { MutationOptions } from "@tanstack/query-core"
import type { BetterFetchError } from "better-auth/client"
import { authQueryKeys } from "../../lib/auth-query-keys"
import type { OrganizationAuthClient } from "./organization-auth-client"
import { organizationMutationKeys } from "./organization-mutation-keys"
import { organizationQueryKeys } from "./organization-query-keys"

type BetterAuthSetActiveTeamParams<TAuthClient extends OrganizationAuthClient> =
  Parameters<TAuthClient["organization"]["setActiveTeam"]>[0]

export type SetActiveTeamParams<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = BetterAuthSetActiveTeamParams<TAuthClient> & { organizationId: string }

export type SetActiveTeamOptions<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Omit<
  ReturnType<typeof setActiveTeamOptions<TAuthClient>>,
  "mutationKey" | "mutationFn" | "meta"
>

export function setActiveTeamOptions<
  TAuthClient extends OrganizationAuthClient
>(authClient: TAuthClient, userId?: string) {
  const mutationFn = (params: SetActiveTeamParams<TAuthClient>) => {
    const { organizationId: _organizationId, ...betterAuthParams } = params
    const fetchOptions = (
      betterAuthParams as { fetchOptions?: Record<string, unknown> }
    ).fetchOptions

    return authClient.organization.setActiveTeam({
      ...betterAuthParams,
      fetchOptions: { ...fetchOptions, throw: true }
    } as BetterAuthSetActiveTeamParams<TAuthClient>)
  }

  return {
    mutationKey: organizationMutationKeys.teams.setActive,
    mutationFn,
    meta: {
      awaits: [authQueryKeys.session],
      invalidates: [organizationQueryKeys.teams.all(userId)]
    }
  } as MutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    BetterFetchError,
    Parameters<typeof mutationFn>[0]
  >
}
