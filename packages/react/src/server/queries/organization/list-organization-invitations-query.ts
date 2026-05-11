import { organizationQueryKeys } from "@better-auth-ui/core"
import { type QueryClient, queryOptions } from "@tanstack/react-query"
import type { Auth } from "better-auth"
import type { OrganizationAuthServer } from "../../../lib/auth-server"
import { assertAuthHasOrganizationOrThrow } from "../../../lib/utils"

type ListInvitationsParams = Parameters<
  OrganizationAuthServer["api"]["listInvitations"]
>[0]

export const organizationInvitationsOptions = <T extends Auth>(
  auth: T,
  params: ListInvitationsParams
) => {
  assertAuthHasOrganizationOrThrow(auth)
  return queryOptions({
    queryKey: organizationQueryKeys.listOrganizationInvitations(),
    queryFn: async () => auth.api.listInvitations(params)
  })
}

export const prefetchOrganizationInvitations = <T extends Auth>(
  queryClient: QueryClient,
  auth: T,
  params: ListInvitationsParams
) => queryClient.prefetchQuery(organizationInvitationsOptions(auth, params))
