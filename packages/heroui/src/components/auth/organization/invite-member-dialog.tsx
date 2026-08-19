import type { OrganizationAuthClient } from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import {
  useActiveOrganization,
  useInviteMember,
  useListOrganizationInvitations,
  useListTeams
} from "@better-auth-ui/react/plugins/organization"
import { PersonPlus } from "@gravity-ui/icons"
import {
  AlertDialog,
  Button,
  Checkbox,
  FieldError,
  Form,
  Input,
  Label,
  ListBox,
  Select,
  Spinner,
  TextField,
  toast
} from "@heroui/react"
import { type SyntheticEvent, useEffect, useRef, useState } from "react"

import { organizationPlugin } from "../../../lib/auth/organization-plugin"

/** Props for the {@link InviteMemberDialog} component. */
export type InviteMemberDialogProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

const pickDefaultRole = (keys: string[]) =>
  keys.includes("member") ? "member" : (keys.at(-1) ?? "")

/**
 * Render a dialog for inviting a member to the organization.
 *
 * @param isOpen - Whether the dialog is open
 * @param onOpenChange - Callback for when the dialog open state changes
 * @returns The invite member dialog as a JSX element
 */
export function InviteMemberDialog({
  isOpen,
  onOpenChange
}: InviteMemberDialogProps) {
  const { authClient, localization } = useAuth()
  const {
    invitationLimit,
    localization: organizationLocalization,
    roles,
    teams: teamsEnabled
  } = useAuthPlugin(organizationPlugin)
  const { data: activeOrganization } = useActiveOrganization(
    authClient as OrganizationAuthClient
  )
  const teams = useListTeams(authClient as OrganizationAuthClient, {
    query: { organizationId: activeOrganization?.id }
  })
  const invitations = useListOrganizationInvitations(
    authClient as OrganizationAuthClient
  )
  const invitationLimitReached =
    invitationLimit !== undefined &&
    (invitations.data?.filter((invitation) => invitation.status === "pending")
      .length ?? 0) >= invitationLimit
  const [teamIds, setTeamIds] = useState<string[]>([])
  const activeOrganizationId = activeOrganization?.id
  const previousOrganizationId = useRef(activeOrganizationId)

  const [selectedRoles, setSelectedRoles] = useState(() => {
    const fallback = pickDefaultRole(Object.keys(roles))
    return fallback ? [fallback] : []
  })

  useEffect(() => {
    setSelectedRoles((current) => {
      const keys = Object.keys(roles)
      const kept = current.filter((entry) => keys.includes(entry))

      if (kept.length > 0) return kept

      const fallback = pickDefaultRole(keys)
      return fallback ? [fallback] : []
    })
  }, [roles])

  useEffect(() => {
    const organizationChanged =
      previousOrganizationId.current !== activeOrganizationId

    if (isOpen || organizationChanged) setTeamIds([])
    previousOrganizationId.current = activeOrganizationId
  }, [isOpen, activeOrganizationId])

  const { mutate: inviteMember, isPending: isInviting } = useInviteMember(
    authClient as OrganizationAuthClient,
    {
      onSuccess: () => {
        onOpenChange(false)
        toast.success(organizationLocalization.inviteMemberSuccess)
      }
    }
  )

  const isRoleValid = selectedRoles.length > 0

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!isRoleValid || invitationLimitReached) return

    const formData = new FormData(e.target as HTMLFormElement)
    const email = formData.get("email") as string

    const availableTeamIds = new Set(teams.data?.map((team) => team.id))
    const selectedTeamIds = teamIds.filter((teamId) =>
      availableTeamIds.has(teamId)
    )

    inviteMember({
      email: email.trim(),
      role: selectedRoles as Parameters<typeof inviteMember>[0]["role"],
      ...(selectedTeamIds.length ? { teamId: selectedTeamIds } : {})
    })
  }

  return (
    <AlertDialog.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <AlertDialog.Container>
        <AlertDialog.Dialog>
          <Form onSubmit={handleSubmit}>
            <AlertDialog.CloseTrigger />

            <AlertDialog.Header>
              <AlertDialog.Icon status="default">
                <PersonPlus />
              </AlertDialog.Icon>

              <AlertDialog.Heading>
                {organizationLocalization.inviteMember}
              </AlertDialog.Heading>
            </AlertDialog.Header>

            <AlertDialog.Body className="flex flex-col gap-4 overflow-visible">
              <p className="text-muted text-sm">
                {organizationLocalization.inviteMemberDescription}
              </p>
              {invitationLimitReached && (
                <p className="text-danger text-sm" role="alert">
                  {organizationLocalization.invitationLimitReached}
                </p>
              )}

              <TextField
                id="email"
                name="email"
                type="email"
                isDisabled={isInviting}
                validate={(value) => {
                  if (!value) return localization.auth.fieldRequired
                  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
                    return localization.auth.invalidEmail
                }}
              >
                <Label>{localization.auth.email}</Label>

                <Input
                  autoFocus
                  placeholder={localization.auth.email}
                  variant="secondary"
                  required
                />

                <FieldError />
              </TextField>

              <Select
                name="role"
                selectionMode="multiple"
                value={selectedRoles}
                onChange={(keys) => {
                  const next = [...(keys as Iterable<string>)]

                  // An invitation always carries at least one role.
                  if (next.length === 0) return

                  setSelectedRoles(next)
                }}
                isDisabled={isInviting}
                variant="secondary"
                fullWidth
              >
                <Label>{organizationLocalization.role}</Label>

                <Select.Trigger>
                  <Select.Value />
                  <Select.Indicator />
                </Select.Trigger>

                <Select.Popover>
                  <ListBox selectionMode="multiple">
                    {Object.entries(roles).map(([key, label]) => (
                      <ListBox.Item key={key} id={key} textValue={label}>
                        {label}

                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                    ))}
                  </ListBox>
                </Select.Popover>

                <FieldError />
              </Select>
              {teamsEnabled && (teams.data?.length ?? 0) > 0 && (
                <div className="flex flex-col gap-2">
                  <Label>{organizationLocalization.teams}</Label>
                  <div className="flex flex-wrap gap-3">
                    {teams.data?.map((team) => (
                      <Checkbox
                        key={team.id}
                        isSelected={teamIds.includes(team.id)}
                        onChange={(selected) =>
                          setTeamIds((current) =>
                            selected
                              ? [...current, team.id]
                              : current.filter((id) => id !== team.id)
                          )
                        }
                      >
                        {team.name}
                      </Checkbox>
                    ))}
                  </div>
                </div>
              )}
            </AlertDialog.Body>

            <AlertDialog.Footer>
              <Button slot="close" variant="tertiary" isDisabled={isInviting}>
                {localization.settings.cancel}
              </Button>

              <Button
                type="submit"
                isPending={isInviting}
                isDisabled={!isRoleValid || invitationLimitReached}
              >
                {isInviting && <Spinner color="current" size="sm" />}

                {organizationLocalization.inviteMember}
              </Button>
            </AlertDialog.Footer>
          </Form>
        </AlertDialog.Dialog>
      </AlertDialog.Container>
    </AlertDialog.Backdrop>
  )
}
