import { organizationQueryKeys } from "@better-auth-ui/core"
import { useQuery } from "@tanstack/react-query"
import type { AuthClient } from "../../lib/auth-client"
import { assertAuthClientHasOrganizationOrThrow } from "../../lib/utils"

/**
 * Query the members of the active organization.
 *
 * Auth resolves the organization from the session, so callers don't pass an ID.
 * Shares the query key with `organizationMembersOptions` for SSR hydration.
 */
export function useOrganizationMembers(authClient: AuthClient) {
  assertAuthClientHasOrganizationOrThrow(authClient)

  return useQuery({
    queryKey: organizationQueryKeys.listOrganizationMembers(),
    queryFn: async () => {
      const { members } = await authClient.organization.listMembers({
        fetchOptions: {
          throw: true
        }
      })

      return members
    }
  })
}
