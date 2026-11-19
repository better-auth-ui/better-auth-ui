import { type QueryOptions, skipToken } from "@tanstack/query-core"
import type { InferData } from "../../lib/auth-client"
import { createAuthQueryFetchOptions } from "../../lib/auth-query-retry"
import type { OrganizationRolesAuthClient } from "./organization-auth-client"
import { organizationQueryKeys } from "./organization-query-keys"
import { authRequestData } from "../../lib/auth-request-data"

export type OrganizationRoleData<
  TAuthClient extends OrganizationRolesAuthClient = OrganizationRolesAuthClient
> = InferData<TAuthClient["organization"]["getRole"]>

export type OrganizationRoleParams<
  TAuthClient extends OrganizationRolesAuthClient = OrganizationRolesAuthClient
> = Parameters<TAuthClient["organization"]["getRole"]>[0]

export function roleOptions<TAuthClient extends OrganizationRolesAuthClient>(
  authClient: TAuthClient,
  userId?: string,
  params?: OrganizationRoleParams<TAuthClient>
) {
  const organizationId = params?.query.organizationId
  const roleId = params?.query.roleId
  const roleName = params?.query.roleName

  return {
    queryKey: organizationQueryKeys.roles.detail(userId, params?.query),
    queryFn:
      userId && organizationId && (roleId || roleName)
        ? ({ signal }) =>
            authRequestData<OrganizationRoleData<TAuthClient>>(
              authClient.organization.getRole({
                ...params,
                query: { ...params.query, organizationId },
                fetchOptions: createAuthQueryFetchOptions(
                  params.fetchOptions,
                  signal
                )
              })
            )
        : skipToken
  } satisfies QueryOptions
}
