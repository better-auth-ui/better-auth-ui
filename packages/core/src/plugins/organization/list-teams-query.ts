import { type QueryOptions, skipToken } from "@tanstack/query-core"
import type { InferData } from "../../lib/auth-client"
import { createAuthQueryFetchOptions } from "../../lib/auth-query-retry"
import type { OrganizationAuthClient } from "./organization-auth-client"
import { organizationQueryKeys } from "./organization-query-keys"

export type ListTeamsData<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = InferData<TAuthClient["organization"]["listTeams"]>
export type ListTeamsParams<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Parameters<TAuthClient["organization"]["listTeams"]>[0]
export type ListedTeam<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = NonNullable<ListTeamsData<TAuthClient>>[number]

export function listTeamsOptions<TAuthClient extends OrganizationAuthClient>(
  authClient: TAuthClient,
  userId?: string,
  params?: ListTeamsParams<TAuthClient>
) {
  const query = params?.query as { organizationId?: string } | undefined
  return {
    queryKey: organizationQueryKeys.teams.list(userId, params?.query),
    queryFn:
      userId && query?.organizationId
        ? ({ signal }) =>
            authClient.organization.listTeams({
              ...params,
              fetchOptions: createAuthQueryFetchOptions(
                params?.fetchOptions,
                signal
              )
            }) as Promise<ListTeamsData<TAuthClient>>
        : skipToken
  } satisfies QueryOptions
}
