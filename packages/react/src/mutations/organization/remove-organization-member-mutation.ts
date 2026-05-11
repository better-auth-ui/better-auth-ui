import { organizationQueryKeys } from "@better-auth-ui/core"
import {
  mutationOptions,
  useMutation,
  useQueryClient
} from "@tanstack/react-query"
import type { BetterFetchError } from "better-auth/react"
import type { AuthClient, OrganizationAuthClient } from "../../lib/auth-client"
import { assertAuthClientHasOrganizationOrThrow } from "../../lib/utils"

export type RemoveMemberOptions = Omit<
  ReturnType<typeof removeMemberOptions>,
  "mutationKey" | "mutationFn"
>

type RemoveMemberParams = Parameters<
  OrganizationAuthClient["organization"]["removeMember"]
>[0]

const mutationKey = ["organization", "removeMember"] as const

/**
 * Mutation options factory for removing a member from the active organization.
 */
export function removeMemberOptions(authClient: OrganizationAuthClient) {
  const mutationFn = (params: RemoveMemberParams) =>
    authClient.organization.removeMember({
      ...params,
      fetchOptions: { ...params?.fetchOptions, throw: true }
    })

  return mutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    BetterFetchError,
    Parameters<typeof mutationFn>[0]
  >({
    mutationKey,
    mutationFn
  })
}

/**
 * Create a mutation for removing a member from the active organization.
 *
 * Wraps `authClient.organization.removeMember` and invalidates the
 * organization members list so consumers reflect the removal.
 */
export function useRemoveMember(
  authClient: AuthClient,
  options?: RemoveMemberOptions
) {
  assertAuthClientHasOrganizationOrThrow(authClient)
  const queryClient = useQueryClient()

  return useMutation({
    ...removeMemberOptions(authClient),
    ...options,
    onSuccess: async (data, variables, ...rest) => {
      await queryClient.invalidateQueries({
        queryKey: organizationQueryKeys.listOrganizationMembers()
      })

      await options?.onSuccess?.(data, variables, ...rest)
    }
  })
}
