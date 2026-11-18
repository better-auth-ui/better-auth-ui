import { type QueryOptions, skipToken } from "@tanstack/query-core"
import type { InferData } from "../../lib/auth-client"
import { createAuthQueryFetchOptions } from "../../lib/auth-query-retry"
import type { OrganizationTeamsAuthClient } from "./organization-auth-client"
import { organizationQueryKeys } from "./organization-query-keys"
import { authRequestData } from "../../lib/auth-request-data"

export type ListTeamsData<
  TAuthClient extends OrganizationTeamsAuthClient = OrganizationTeamsAuthClient
> = InferData<TAuthClient["organization"]["listTeams"]>
export type ListTeamsParams<
  TAuthClient extends OrganizationTeamsAuthClient = OrganizationTeamsAuthClient
> = Parameters<TAuthClient["organization"]["listTeams"]>[0]
export type ListedTeam<
  TAuthClient extends OrganizationTeamsAuthClient = OrganizationTeamsAuthClient
> = NonNullable<ListTeamsData<TAuthClient>>[number]

export function listTeamsOptions<
  TAuthClient extends OrganizationTeamsAuthClient
>(
  authClient: TAuthClient,
  userId?: string,
  params?: ListTeamsParams<TAuthClient>
) {
  const query = params?.query
  return {
    queryKey: organizationQueryKeys.teams.list(userId, params?.query),
    queryFn:
      userId && query?.organizationId
        ? ({ signal }) =>
            authRequestData<ListTeamsData<TAuthClient>>(
              authClient.organization.listTeams({
                ...params,
                fetchOptions: createAuthQueryFetchOptions(
                  params?.fetchOptions,
                  signal
                )
              })
            )
        : skipToken
  } satisfies QueryOptions
}
