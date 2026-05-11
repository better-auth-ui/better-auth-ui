import { organizationQueryKeys } from "@better-auth-ui/core"
import type { AuthClient } from "@better-auth-ui/react"
import { useQuery } from "@tanstack/react-query"
import { assertAuthClientHasOrganizationOrThrow } from "../../lib/utils"

/**
 * Query the full active organization for the current session.
 *
 * Uses a query key nested under `organizations` so invalidating
 * `customQueryKeys.organizations()` also refetches this query.
 */
export function useActiveOrganization(authClient: AuthClient) {
  assertAuthClientHasOrganizationOrThrow(authClient)

  return useQuery({
    queryKey: organizationQueryKeys.getActiveOrganization(),
    queryFn: async () => {
      return await authClient.organization.getFullOrganization({
        fetchOptions: {
          throw: true
        }
      })
    }
  })
}
