import {
  getAdditionalFieldDefaultValues,
  getAdditionalFieldSubmitValues,
  validateEmailAddress
} from "@better-auth-ui/core"
import {
  hasMemberRole,
  type OrganizationTeamsAuthClient,
  type InviteMemberParams
} from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import {
  useActiveOrganization,
  useActiveMemberRole,
  useInviteMember,
  useHasPermission,
  useListOrganizationMembers,
  useListOrganizationInvitations,
  useListTeams
} from "@better-auth-ui/react/plugins/organization"
import { useState } from "react"
import { organizationPlugin } from "../../../lib/auth/organization-plugin"
import { AlertDialog } from "../../../primitives/alert-dialog"
import { Button } from "../../../primitives/button"
import { Checkbox } from "../../../primitives/checkbox"
import { Description } from "../../../primitives/description"
import { Box, Txt } from "../../../primitives/styled"
import { toast } from "../../../primitives/toast"
import { getAuthAdditionalFieldValidators, useAuthForm } from "../auth-form"
import { RolePicker, useOrganizationRoleLabels } from "./role-picker"

export type InviteMemberDialogProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}
export function InviteMemberDialog({
  isOpen,
  onOpenChange
}: InviteMemberDialogProps) {
  return isOpen ? (
    <InviteMemberForm onClose={() => onOpenChange(false)} />
  ) : null
}
function InviteMemberForm({ onClose }: { onClose: () => void }) {
  const { authClient, localization: common } = useAuth()
  const {
    localization,
    allowMultipleRoles,
    creatorRole,
    modelFields,
    teams: teamsEnabled,
    invitationLimit,
    membershipLimit
  } = useAuthPlugin(organizationPlugin)
  const client = authClient as OrganizationTeamsAuthClient
  const organization = useActiveOrganization(client)
  const organizationId = organization.data?.id
  const role = useActiveMemberRole(client, { query: { organizationId } })
  const labels = useOrganizationRoleLabels(organizationId)
  const roles = Object.fromEntries(
    Object.entries(labels).filter(
      ([key]) =>
        hasMemberRole(role.data?.role, creatorRole) || key !== creatorRole
    )
  )
  const permission = useHasPermission(client, {
    organizationId,
    permissions: { invitation: ["create"] }
  })
  const members = useListOrganizationMembers(client, {
    query: { organizationId },
    enabled: !!organizationId
  })
  const invitations = useListOrganizationInvitations(client, {
    query: { organizationId },
    enabled: !!organizationId
  })
  const teams = useListTeams(client, {
    query: { organizationId },
    enabled: teamsEnabled && !!organizationId
  })
  const invite = useInviteMember(client)
  const [selectedRoles, setRoles] = useState([
    Object.hasOwn(labels, "member")
      ? "member"
      : (Object.keys(roles).at(-1) ?? "")
  ])
  const [selectedTeams, setTeams] = useState<string[]>([])
  const atMemberLimit =
    membershipLimit !== undefined &&
    (members.data?.total ?? members.data?.members.length ?? 0) >=
      membershipLimit
  const atInvitationLimit =
    invitationLimit !== undefined &&
    (invitations.data?.filter((invitation) => invitation.status === "pending")
      .length ?? 0) >= invitationLimit
  const form = useAuthForm({
    defaultValues: {
      email: "",
      additionalFields: getAdditionalFieldDefaultValues(modelFields.invitation)
    },
    onSubmit: async ({ value }) => {
      if (
        !permission.data?.success ||
        !organizationId ||
        atMemberLimit ||
        atInvitationLimit ||
        !selectedRoles.length ||
        selectedRoles.some((role) => !Object.hasOwn(roles, role))
      )
        throw new Error(localization.selectAtLeastOneRole)
      await invite.mutateAsync({
        ...getAdditionalFieldSubmitValues(
          modelFields.invitation,
          value.additionalFields
        ),
        email: value.email.trim(),
        organizationId,
        role: selectedRoles,
        ...(selectedTeams.length && {
          teamId: selectedTeams.filter((id) =>
            teams.data?.some((team) => team.id === id)
          )
        })
      } as InviteMemberParams)
      toast.success(localization.inviteMemberSuccess)
      onClose()
    }
  })
  return (
    <AlertDialog
      isOpen
      onOpenChange={(open) => {
        if (!open && !invite.isPending) onClose()
      }}
    >
      <AlertDialog.Header>
        <AlertDialog.Heading>{localization.inviteMember}</AlertDialog.Heading>
      </AlertDialog.Header>
      <AlertDialog.Body>
        <form.AppForm>
          <form.AuthFormRoot className="gap-4">
            <Description>{localization.inviteMemberDescription}</Description>
            <form.AppField
              name="email"
              validators={{
                onChange: ({ value }) =>
                  validateEmailAddress(value, {
                    requiredMessage: common.auth.fieldRequired,
                    invalidMessage: common.auth.invalidEmail
                  })
              }}
            >
              {(field) => (
                <field.AuthFormTextField
                  label={common.auth.email}
                  type="email"
                  autoComplete="email"
                  isDisabled={invite.isPending}
                />
              )}
            </form.AppField>
            <RolePicker
              roles={roles}
              value={selectedRoles}
              onChange={setRoles}
              multiple={allowMultipleRoles}
              disabled={invite.isPending || role.isPending}
            />
            {teamsEnabled && teams.data?.length ? (
              <Box className="gap-2">
                <Txt>{localization.teams}</Txt>
                {teams.data.map((team) => (
                  <Checkbox
                    key={team.id}
                    isSelected={selectedTeams.includes(team.id)}
                    isDisabled={invite.isPending}
                    onChange={(checked) =>
                      setTeams(
                        checked
                          ? [...selectedTeams, team.id]
                          : selectedTeams.filter((id) => id !== team.id)
                      )
                    }
                  >
                    {team.name}
                  </Checkbox>
                ))}
              </Box>
            ) : null}
            {modelFields.invitation.map((configured) => (
              <form.AppField
                key={configured.name}
                name={`additionalFields.${configured.name}`}
                validators={getAuthAdditionalFieldValidators(
                  configured,
                  common.auth.fieldRequired
                )}
              >
                {(field) => (
                  <field.AuthFormAdditionalField
                    field={configured}
                    isPending={invite.isPending}
                  />
                )}
              </form.AppField>
            ))}
            {atMemberLimit || atInvitationLimit ? (
              <Description>
                {atMemberLimit
                  ? localization.membershipLimitReached
                  : localization.invitationLimitReached}
              </Description>
            ) : null}
            <AlertDialog.Footer>
              <Button isDisabled={invite.isPending} onPress={onClose}>
                {common.settings.cancel}
              </Button>
              <form.AuthFormSubmitButton
                isPending={invite.isPending}
                isDisabled={
                  !permission.data?.success ||
                  role.isPending ||
                  !selectedRoles.length ||
                  atMemberLimit ||
                  atInvitationLimit ||
                  (membershipLimit !== undefined && members.isPending) ||
                  (invitationLimit !== undefined && invitations.isPending)
                }
              >
                {localization.inviteMember}
              </form.AuthFormSubmitButton>
            </AlertDialog.Footer>
          </form.AuthFormRoot>
        </form.AppForm>
      </AlertDialog.Body>
    </AlertDialog>
  )
}
