import { organizationQueryKeys } from "@better-auth-ui/core/plugins/organization"
import type { AuthMutationMeta } from "../create-auth-mutation"

export type { AuthMutationMeta }

export const createOrganizationMeta = (
  userId: string | undefined
): AuthMutationMeta => ({
  awaits: [organizationQueryKeys.lists(userId)],
  invalidates: [
    organizationQueryKeys.fullDetails(userId),
    organizationQueryKeys.activeOrganizations(userId)
  ]
})

export const updateOrganizationMeta = (
  userId: string | undefined
): AuthMutationMeta => ({
  awaits: [
    organizationQueryKeys.lists(userId),
    organizationQueryKeys.fullDetails(userId),
    organizationQueryKeys.activeOrganizations(userId)
  ]
})

export const deleteOrganizationMeta = createOrganizationMeta

export const setActiveOrganizationMeta = (
  userId: string | undefined
): AuthMutationMeta => ({
  awaits: [organizationQueryKeys.activeOrganizations(userId)],
  invalidates: [organizationQueryKeys.lists(userId)]
})

export const inviteMemberMeta = (
  userId: string | undefined
): AuthMutationMeta => ({
  awaits: [
    organizationQueryKeys.invitations.all(userId),
    organizationQueryKeys.fullDetails(userId)
  ]
})

export const memberRoleMeta = (
  userId: string | undefined
): AuthMutationMeta => ({
  awaits: [
    organizationQueryKeys.members.all(userId),
    organizationQueryKeys.fullDetails(userId)
  ],
  invalidates: [organizationQueryKeys.permissions.all(userId)]
})

export const removeMemberMeta = (
  userId: string | undefined
): AuthMutationMeta => ({
  awaits: [
    organizationQueryKeys.members.all(userId),
    organizationQueryKeys.fullDetails(userId)
  ],
  invalidates: [organizationQueryKeys.lists(userId)]
})

export const leaveOrganizationMeta = (
  userId: string | undefined
): AuthMutationMeta => ({
  awaits: [
    organizationQueryKeys.members.all(userId),
    organizationQueryKeys.fullDetails(userId)
  ],
  invalidates: [
    organizationQueryKeys.lists(userId),
    organizationQueryKeys.activeOrganizations(userId)
  ]
})

export const acceptInvitationMeta = (
  userId: string | undefined
): AuthMutationMeta => ({
  awaits: [
    organizationQueryKeys.userInvitations.all(userId),
    organizationQueryKeys.lists(userId)
  ],
  invalidates: [
    organizationQueryKeys.fullDetails(userId),
    organizationQueryKeys.activeOrganizations(userId)
  ]
})

export const cancelInvitationMeta = (
  userId: string | undefined
): AuthMutationMeta => ({
  awaits: [
    organizationQueryKeys.invitations.all(userId),
    organizationQueryKeys.fullDetails(userId)
  ]
})

export const rejectInvitationMeta = (
  userId: string | undefined
): AuthMutationMeta => ({
  awaits: [organizationQueryKeys.userInvitations.all(userId)]
})
