import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { BetterFetchError } from "better-auth/react"
import type { AuthClient } from "../../lib/auth-client"
import { assertAuthClientHasOrganizationOrThrow } from "../../lib/utils"

/**
 * Mutation to set the active organization for the current session.
 *
 * Invalidates every query in the cache so any org-scoped data fetched by the
 * consumer is refetched against the new active organization.
 */
export function useSetActiveOrganization(authClient: AuthClient) {
  assertAuthClientHasOrganizationOrThrow(authClient)
  const queryClient = useQueryClient()

  return useMutation<
    Awaited<ReturnType<typeof authClient.organization.setActive>>,
    BetterFetchError,
    string | null
  >({
    mutationFn: async (organizationId) => {
      return await authClient.organization.setActive({
        organizationId,
        fetchOptions: {
          throw: true
        }
      })
    },
    onSuccess: async () => {
      // Invalidate all user queries for safety.
      await queryClient.invalidateQueries()
    }
  })
}
