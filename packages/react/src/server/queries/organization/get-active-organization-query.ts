import { organizationQueryKeys } from "@better-auth-ui/core"
import { type QueryClient, queryOptions } from "@tanstack/react-query"
import type { Auth } from "better-auth"
import type { OrganizationAuthServer } from "../../../lib/auth-server"
import { assertAuthHasOrganizationOrThrow } from "../../../lib/utils"

type GetFullOrganizationParams = Parameters<
  OrganizationAuthServer["api"]["getFullOrganization"]
>[0]

export const activeOrganizationOptions = <T extends Auth>(
  auth: T,
  params: GetFullOrganizationParams
) => {
  assertAuthHasOrganizationOrThrow(auth)
  return queryOptions({
    queryKey: organizationQueryKeys.getActiveOrganization(),
    queryFn: async () => auth.api.getFullOrganization(params)
  })
}

export const prefetchActiveOrganization = <T extends Auth>(
  queryClient: QueryClient,
  auth: T,
  params: GetFullOrganizationParams
) => queryClient.prefetchQuery(activeOrganizationOptions(auth, params))
