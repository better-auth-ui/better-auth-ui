import { type QueryOptions, skipToken } from "@tanstack/query-core"
import type { InferData } from "../../lib/auth-client"
import { createAuthQueryFetchOptions } from "../../lib/auth-query-retry"
import type { OrganizationAuthClient } from "./organization-auth-client"
import { organizationQueryKeys } from "./organization-query-keys"

export type ListRolesData<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = InferData<TAuthClient["organization"]["listRoles"]>

export type ListRolesParams<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Parameters<TAuthClient["organization"]["listRoles"]>[0]

export type ListedOrganizationRole<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = NonNullable<ListRolesData<TAuthClient>>[number]

export function listRolesOptions<TAuthClient extends OrganizationAuthClient>(
  authClient: TAuthClient,
  userId?: string,
  params?: ListRolesParams<TAuthClient>
) {
  const organizationId = params?.query?.organizationId

  return {
    queryKey: organizationQueryKeys.roles.list(userId, params?.query),
    queryFn:
      userId && organizationId
        ? ({ signal }) =>
            authClient.organization.listRoles({
              ...params,
              query: { ...params?.query, organizationId },
              fetchOptions: createAuthQueryFetchOptions(
                params?.fetchOptions,
                signal
              )
            }) as Promise<ListRolesData<TAuthClient>>
        : skipToken
  } satisfies QueryOptions
}
