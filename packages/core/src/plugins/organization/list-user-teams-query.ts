import { type QueryOptions, skipToken } from "@tanstack/query-core"
import type { InferData } from "../../lib/auth-client"
import { createAuthQueryFetchOptions } from "../../lib/auth-query-retry"
import type { OrganizationTeamsAuthClient } from "./organization-auth-client"
import { organizationQueryKeys } from "./organization-query-keys"

export type ListUserTeamsData<
  TAuthClient extends OrganizationTeamsAuthClient = OrganizationTeamsAuthClient
> = InferData<TAuthClient["organization"]["listUserTeams"]>
export type ListUserTeamsParams<
  TAuthClient extends OrganizationTeamsAuthClient = OrganizationTeamsAuthClient
> = Parameters<TAuthClient["organization"]["listUserTeams"]>[0]
export type ListedUserTeam<
  TAuthClient extends OrganizationTeamsAuthClient = OrganizationTeamsAuthClient
> = NonNullable<ListUserTeamsData<TAuthClient>>[number]

export function listUserTeamsOptions<
  TAuthClient extends OrganizationTeamsAuthClient
>(
  authClient: TAuthClient,
  userId?: string,
  params?: ListUserTeamsParams<TAuthClient>
) {
  const query = params?.query as { organizationId?: string } | undefined

  return {
    queryKey: organizationQueryKeys.teams.userList(userId, params?.query),
    queryFn:
      userId && query?.organizationId
        ? ({ signal }) =>
            authClient.organization.listUserTeams({
              ...params,
              fetchOptions: createAuthQueryFetchOptions(
                params?.fetchOptions,
                signal
              )
            }) as Promise<ListUserTeamsData<TAuthClient>>
        : skipToken
  } satisfies QueryOptions
}
