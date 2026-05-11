import { organizationQueryKeys } from "@better-auth-ui/core"
import { useQuery } from "@tanstack/react-query"
import type { Organization } from "better-auth/client/plugins"
import type { AuthClient } from "../../lib/auth-client"
import { assertAuthClientHasOrganizationOrThrow } from "../../lib/utils"

/**
 * Query all organizations for the current user.
 */
export function useOrganizations(authClient: AuthClient) {
  assertAuthClientHasOrganizationOrThrow(authClient)

  return useQuery({
    queryKey: organizationQueryKeys.listOrganizations(),
    queryFn: async (): Promise<Organization[]> => {
      return await authClient.organization.list({
        fetchOptions: {
          throw: true
        }
      })
    }
  })
}
