import { organizationQueryKeys } from "@better-auth-ui/core"
import { type QueryClient, queryOptions } from "@tanstack/react-query"
import type { Auth } from "better-auth"
import type { OrganizationAuthServer } from "../../../lib/auth-server"
import { assertAuthHasOrganizationOrThrow } from "../../../lib/utils"

type ListMembersParams = Parameters<
  OrganizationAuthServer["api"]["listMembers"]
>[0]

export const organizationMembersOptions = <T extends Auth>(
  auth: T,
  params: ListMembersParams
) => {
  assertAuthHasOrganizationOrThrow(auth)
  return queryOptions({
    queryKey: organizationQueryKeys.listOrganizationMembers(),
    queryFn: async () => auth.api.listMembers(params)
  })
}

export const prefetchOrganizationMembers = <T extends Auth>(
  queryClient: QueryClient,
  auth: T,
  params: ListMembersParams
) => queryClient.prefetchQuery(organizationMembersOptions(auth, params))
