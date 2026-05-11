import { organizationQueryKeys } from "@better-auth-ui/core"
import { useQuery } from "@tanstack/react-query"
import type { AuthClient } from "../../lib/auth-client"
import { assertAuthClientHasOrganizationOrThrow } from "../../lib/utils"

/**
 * Query the current user's role in the active organization.
 *
 * Cached under `["organizations", "active", "member-role"]` so it's
 * refetched whenever any organization-scoped invalidation runs.
 */
export function useActiveMemberRole(authClient: AuthClient) {
  assertAuthClientHasOrganizationOrThrow(authClient)

  return useQuery({
    queryKey: organizationQueryKeys.getActiveMemberRole(),
    queryFn: async () => {
      const result = await authClient.organization.getActiveMemberRole({
        fetchOptions: { throw: true }
      })
      return result?.role ?? null
    },
    retry: false
  })
}
