import {
  getAdditionalFieldDefaultValues,
  getAdditionalFieldSubmitValues,
  validateEmailAddress
} from "@better-auth-ui/core"
import {
  mergeOrganizationRoleLabels,
  type OrganizationAuthClient,
  type OrganizationRolesAuthClient,
  type OrganizationTeamsAuthClient
} from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import {
  useActiveOrganization,
  useHasPermission,
  useInviteMember,
  useListOrganizationInvitations,
  useListRoles,
  useListTeams
} from "@better-auth-ui/react/plugins/organization"
import { PersonPlus } from "@gravity-ui/icons"
import {
  AlertDialog,
  Button,
  Checkbox,
  Input,
  Label,
  ListBox,
  Select,
  TextField,
  toast
} from "@heroui/react"
import { useEffect, useMemo, useRef } from "react"

import { organizationPlugin } from "../../../lib/auth/organization-plugin"
import {
  getAuthAdditionalFieldValidators,
  isAuthFormFieldInvalid,
  useAuthForm
} from "../auth-form"

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
    allowMultipleRoles,
    modelFields: { invitation: invitationFields },
    dynamicAccessControl,
    invitationLimit,
    localization: organizationLocalization,
    roles,
    teams: teamsEnabled
  } = useAuthPlugin(organizationPlugin)
  const { data: activeOrganization } = useActiveOrganization(
    authClient as OrganizationAuthClient
  )
  const teams = useListTeams(authClient as OrganizationTeamsAuthClient, {
    query: { organizationId: activeOrganization?.id },
    enabled: teamsEnabled
  })
  const invitations = useListOrganizationInvitations(
    authClient as OrganizationAuthClient
  )
  const canInvite = useHasPermission(authClient as OrganizationAuthClient, {
    organizationId: activeOrganization?.id,
    permissions: { invitation: ["create"] }
  })
  const canReadRoles = useHasPermission(authClient as OrganizationAuthClient, {
    organizationId: activeOrganization?.id,
    permissions: { ac: ["read"] }
  })
  const dynamicRoles = useListRoles(authClient as OrganizationRolesAuthClient, {
    query: { organizationId: activeOrganization?.id },
    enabled:
      dynamicAccessControl?.enabled === true &&
      canReadRoles.data?.success === true
  })
  const assignableRoles = useMemo(
    () => mergeOrganizationRoleLabels(roles, dynamicRoles.data),
    [dynamicRoles.data, roles]
  )
  const invitationLimitReached =
    invitationLimit !== undefined &&
    (invitations.data?.filter((invitation) => invitation.status === "pending")
      .length ?? 0) >= invitationLimit
  const activeOrganizationId = activeOrganization?.id
  const previousOrganizationId = useRef(activeOrganizationId)

  const { mutateAsync: inviteMember, isPending: isInviting } = useInviteMember(
    authClient as OrganizationTeamsAuthClient,
    {
      onSuccess: () => {
        onOpenChange(false)
        toast.success(organizationLocalization.inviteMemberSuccess)
      }
    }
  )

  const form = useAuthForm({
    defaultValues: {
      additionalFields: getAdditionalFieldDefaultValues(invitationFields),
      email: "",
      roles: [] as string[],
      teamIds: [] as string[]
    },
    onSubmit: async ({ value }) => {
      if (
        !activeOrganizationId ||
        !canInvite.data?.success ||
        value.roles.length === 0 ||
        invitationLimitReached
      )
        return

      const availableTeamIds = new Set(teams.data?.map((team) => team.id))
      const teamIds = value.teamIds.filter((teamId) =>
        availableTeamIds.has(teamId)
      )

      try {
        await inviteMember({
          ...getAdditionalFieldSubmitValues(
            invitationFields,
            value.additionalFields
          ),
          email: value.email.trim(),
          organizationId: activeOrganizationId,
          role: value.roles as Parameters<typeof inviteMember>[0]["role"],
          ...(teamIds.length ? { teamId: teamIds } : {})
        })
      } catch {
        // The mutation reports the error through its configured handler.
      }
    }
  })

  useEffect(() => {
    const keys = Object.keys(assignableRoles)
    const current = form.getFieldValue("roles")
    const kept = current.filter((entry) => keys.includes(entry))
    const roles =
      kept.length > 0
        ? allowMultipleRoles
          ? kept
          : kept.slice(0, 1)
        : (() => {
            const fallback = pickDefaultRole(keys)
            return fallback ? [fallback] : []
          })()

    form.setFieldValue("roles", roles)
  }, [allowMultipleRoles, assignableRoles, form])

  useEffect(() => {
    const organizationChanged =
      previousOrganizationId.current !== activeOrganizationId

    if (isOpen || organizationChanged) {
      const fallback = pickDefaultRole(Object.keys(assignableRoles))
      form.reset({
        additionalFields: getAdditionalFieldDefaultValues(invitationFields),
        email: "",
        roles: fallback ? [fallback] : [],
        teamIds: []
      })
    }
    previousOrganizationId.current = activeOrganizationId
  }, [activeOrganizationId, assignableRoles, form, invitationFields, isOpen])

  return (
    <AlertDialog.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <AlertDialog.Container>
        <AlertDialog.Dialog>
          <form.AppForm>
            <form.AuthFormRoot>
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

                <form.AppField
                  name="email"
                  validators={{
                    onChange: ({ value }) =>
                      validateEmailAddress(value, {
                        invalidMessage: localization.auth.invalidEmail,
                        requiredMessage: localization.auth.fieldRequired
                      })
                  }}
                >
                  {(field) => (
                    <TextField
                      id="email"
                      name={field.name}
                      type="email"
                      isDisabled={isInviting}
                      isInvalid={isAuthFormFieldInvalid(field.state.meta)}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={field.handleChange}
                    >
                      <Label>{localization.auth.email}</Label>
                      <Input
                        autoFocus
                        placeholder={localization.auth.email}
                        variant="secondary"
                      />
                      <field.AuthFormFieldError />
                    </TextField>
                  )}
                </form.AppField>

                <form.AppField
                  name="roles"
                  validators={{
                    onChange: ({ value }) =>
                      value.length > 0
                        ? undefined
                        : localization.auth.fieldRequired
                  }}
                >
                  {(field) => (
                    <Select
                      name={field.name}
                      selectionMode={allowMultipleRoles ? "multiple" : "single"}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(keys) => {
                        const next = [...(keys as Iterable<string>)]
                        if (next.length === 0) return
                        field.handleChange(
                          allowMultipleRoles ? next : next.slice(0, 1)
                        )
                      }}
                      isDisabled={isInviting}
                      isInvalid={isAuthFormFieldInvalid(field.state.meta)}
                      variant="secondary"
                      fullWidth
                    >
                      <Label>{organizationLocalization.role}</Label>
                      <Select.Trigger>
                        <Select.Value />
                        <Select.Indicator />
                      </Select.Trigger>
                      <Select.Popover>
                        <ListBox
                          selectionMode={
                            allowMultipleRoles ? "multiple" : "single"
                          }
                        >
                          {Object.entries(assignableRoles).map(
                            ([key, label]) => (
                              <ListBox.Item
                                key={key}
                                id={key}
                                textValue={label}
                              >
                                {label}
                                <ListBox.ItemIndicator />
                              </ListBox.Item>
                            )
                          )}
                        </ListBox>
                      </Select.Popover>
                      <field.AuthFormFieldError />
                    </Select>
                  )}
                </form.AppField>
                {teamsEnabled && (teams.data?.length ?? 0) > 0 && (
                  <form.AppField name="teamIds">
                    {(field) => (
                      <div className="flex flex-col gap-2">
                        <Label>{organizationLocalization.teams}</Label>
                        <div className="flex flex-wrap gap-3">
                          {teams.data?.map((team) => (
                            <Checkbox
                              key={team.id}
                              isSelected={field.state.value.includes(team.id)}
                              onChange={(selected) =>
                                field.handleChange(
                                  selected
                                    ? [...field.state.value, team.id]
                                    : field.state.value.filter(
                                        (id) => id !== team.id
                                      )
                                )
                              }
                            >
                              {team.name}
                            </Checkbox>
                          ))}
                        </div>
                      </div>
                    )}
                  </form.AppField>
                )}
                {invitationFields.map((configuredField) => (
                  <form.AppField
                    key={configuredField.name}
                    name={`additionalFields.${configuredField.name}`}
                    validators={getAuthAdditionalFieldValidators(
                      configuredField,
                      localization.auth.fieldRequired
                    )}
                  >
                    {(field) => (
                      <field.AuthFormAdditionalField
                        field={configuredField}
                        isPending={isInviting}
                        optionalLabel={localization.settings.optional}
                      />
                    )}
                  </form.AppField>
                ))}
              </AlertDialog.Body>

              <AlertDialog.Footer>
                <Button slot="close" variant="tertiary" isDisabled={isInviting}>
                  {localization.settings.cancel}
                </Button>

                <form.AuthFormSubmitButton
                  isDisabled={
                    invitationLimitReached ||
                    canInvite.isPending ||
                    !canInvite.data?.success
                  }
                >
                  {organizationLocalization.inviteMember}
                </form.AuthFormSubmitButton>
              </AlertDialog.Footer>
            </form.AuthFormRoot>
          </form.AppForm>
        </AlertDialog.Dialog>
      </AlertDialog.Container>
    </AlertDialog.Backdrop>
  )
}
