import { organizationQueryKeys } from "@better-auth-ui/core"
import {
  mutationOptions,
  useMutation,
  useQueryClient
} from "@tanstack/react-query"
import type { BetterFetchError } from "better-auth/react"
import type { AuthClient, OrganizationAuthClient } from "../../lib/auth-client"
import { assertAuthClientHasOrganizationOrThrow } from "../../lib/utils"

type InviteMemberParams = Parameters<
  OrganizationAuthClient["organization"]["inviteMember"]
>[0]

export type ResendInvitationOptions = Omit<
  ReturnType<typeof resendInvitationOptions>,
  "mutationKey" | "mutationFn"
>

type ResendInvitationParams = {
  email: string
  role: InviteMemberParams["role"]
  fetchOptions?: InviteMemberParams["fetchOptions"]
}

const mutationKey = ["organization", "resendInvitation"] as const

/**
 * Mutation options factory for resending an invitation.
 *
 * Better Auth has no dedicated resend endpoint — `inviteMember` with
 * `resend: true` re-sends the email for the existing pending invitation.
 */
export function resendInvitationOptions(authClient: OrganizationAuthClient) {
  const mutationFn = (params: ResendInvitationParams) =>
    authClient.organization.inviteMember({
      email: params.email,
      role: params.role,
      resend: true,
      fetchOptions: { ...params.fetchOptions, throw: true }
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
 * Create a mutation for resending an invitation email.
 *
 * Wraps `authClient.organization.inviteMember` with `resend: true` and
 * invalidates the organization invitations list so consumers reflect any
 * updated timestamps.
 */
export function useResendInvitation(
  authClient: AuthClient,
  options?: ResendInvitationOptions
) {
  assertAuthClientHasOrganizationOrThrow(authClient)
  const queryClient = useQueryClient()

  return useMutation({
    ...resendInvitationOptions(authClient),
    ...options,
    onSuccess: async (data, variables, ...rest) => {
      await queryClient.invalidateQueries({
        queryKey: organizationQueryKeys.listOrganizationInvitations()
      })

      await options?.onSuccess?.(data, variables, ...rest)
    }
  })
}
