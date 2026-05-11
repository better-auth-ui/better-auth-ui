import { organizationQueryKeys } from "@better-auth-ui/core"
import { type QueryClient, queryOptions } from "@tanstack/react-query"
import type { Auth } from "better-auth"
import type { OrganizationAuthServer } from "../../../lib/auth-server"
import { assertAuthHasOrganizationOrThrow } from "../../../lib/utils"

type ListOrganizationsParams = Parameters<
  OrganizationAuthServer["api"]["listOrganizations"]
>[0]

export const organizationListOptions = <T extends Auth>(
  auth: T,
  params: ListOrganizationsParams
) => {
  assertAuthHasOrganizationOrThrow(auth)
  return queryOptions({
    queryKey: organizationQueryKeys.listOrganizations(),
    queryFn: async () => auth.api.listOrganizations(params)
  })
}

export const prefetchOrganizationList = <T extends Auth>(
  queryClient: QueryClient,
  auth: T,
  params: ListOrganizationsParams
) => queryClient.prefetchQuery(organizationListOptions(auth, params))
