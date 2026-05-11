import { organizationQueryKeys } from "@better-auth-ui/core"
import { useQuery } from "@tanstack/react-query"
import type { AuthClient } from "../../lib/auth-client"
import { assertAuthClientHasOrganizationOrThrow } from "../../lib/utils"

/**
 * Query the invitations of the active organization.
 *
 * Auth resolves the organization from the session, so callers don't pass an ID.
 * Shares the query key with `organizationInvitationsOptions` for SSR hydration.
 */
export function useOrganizationInvitations(authClient: AuthClient) {
  assertAuthClientHasOrganizationOrThrow(authClient)

  return useQuery({
    queryKey: organizationQueryKeys.listOrganizationInvitations(),
    queryFn: async () => {
      return await authClient.organization.listInvitations({
        fetchOptions: {
          throw: true
        }
      })
    }
  })
}
