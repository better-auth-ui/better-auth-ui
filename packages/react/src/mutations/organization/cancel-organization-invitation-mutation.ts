import { organizationQueryKeys } from "@better-auth-ui/core"
import {
  mutationOptions,
  useMutation,
  useQueryClient
} from "@tanstack/react-query"
import type { BetterFetchError } from "better-auth/react"
import type { AuthClient, OrganizationAuthClient } from "../../lib/auth-client"
import { assertAuthClientHasOrganizationOrThrow } from "../../lib/utils"

export type CancelInvitationOptions = Omit<
  ReturnType<typeof cancelInvitationOptions>,
  "mutationKey" | "mutationFn"
>

type CancelInvitationParams = Parameters<
  OrganizationAuthClient["organization"]["cancelInvitation"]
>[0]

const mutationKey = ["organization", "cancelInvitation"] as const

/**
 * Mutation options factory for canceling an invitation.
 */
export function cancelInvitationOptions(authClient: OrganizationAuthClient) {
  const mutationFn = (params: CancelInvitationParams) =>
    authClient.organization.cancelInvitation({
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
 * Create a mutation for canceling a pending invitation.
 *
 * Wraps `authClient.organization.cancelInvitation` and invalidates the
 * organization invitations list so consumers reflect the canceled status.
 */
export function useCancelInvitation(
  authClient: AuthClient,
  options?: CancelInvitationOptions
) {
  assertAuthClientHasOrganizationOrThrow(authClient)
  const queryClient = useQueryClient()

  return useMutation({
    ...cancelInvitationOptions(authClient),
    ...options,
    onSuccess: async (data, variables, ...rest) => {
      await queryClient.invalidateQueries({
        queryKey: organizationQueryKeys.listOrganizationInvitations()
      })

      await options?.onSuccess?.(data, variables, ...rest)
    }
  })
}
