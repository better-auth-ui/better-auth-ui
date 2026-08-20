import { type QueryOptions, skipToken } from "@tanstack/query-core"
import type { InferData } from "../../lib/auth-client"
import { createAuthQueryFetchOptions } from "../../lib/auth-query-retry"
import type { OrganizationAuthClient } from "./organization-auth-client"
import { organizationQueryKeys } from "./organization-query-keys"

export type OrganizationRoleData<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = InferData<TAuthClient["organization"]["getRole"]>

export type OrganizationRoleParams<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Parameters<TAuthClient["organization"]["getRole"]>[0]

export function roleOptions<TAuthClient extends OrganizationAuthClient>(
  authClient: TAuthClient,
  userId?: string,
  params?: OrganizationRoleParams<TAuthClient>
) {
  const organizationId = params?.query?.organizationId
  const roleId = params?.query?.roleId
  const roleName = params?.query?.roleName

  return {
    queryKey: organizationQueryKeys.roles.detail(userId, params?.query),
    queryFn:
      userId && organizationId && (roleId || roleName)
        ? ({ signal }) =>
            authClient.organization.getRole({
              ...params,
              query: { ...params?.query, organizationId },
              fetchOptions: createAuthQueryFetchOptions(
                params?.fetchOptions,
                signal
              )
            }) as Promise<OrganizationRoleData<TAuthClient>>
        : skipToken
  } satisfies QueryOptions
}
