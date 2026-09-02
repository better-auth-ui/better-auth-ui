"use client"

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
import { ChevronDown, UserPlus } from "lucide-react"
import { useEffect, useMemo, useRef } from "react"
import { toast } from "sonner"
import { buttonVariants } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { organizationPlugin } from "@/lib/auth/organization-plugin"
import { cn } from "@/lib/utils"
import {
  getAuthAdditionalFieldValidators,
  isAuthFormFieldInvalid,
  useAuthForm
} from "../auth-form"

/** Props for the `InviteMemberDialog` component. */
export type InviteMemberDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const pickDefaultRole = (keys: string[]) =>
  keys.includes("member") ? "member" : (keys.at(-1) ?? "")

/**
 * Render a dialog for inviting a member to the organization.
 */
export function InviteMemberDialog({
  open,
  onOpenChange
}: InviteMemberDialogProps) {
  const { authClient, localization } = useAuth<OrganizationAuthClient>()
  const {
    allowMultipleRoles,
    modelFields: { invitation: invitationFields },
    dynamicAccessControl,
    invitationLimit,
    localization: organizationLocalization,
    roles,
    teams: teamsEnabled
  } = useAuthPlugin(organizationPlugin)
  const { data: activeOrganization } = useActiveOrganization(authClient)
  const teams = useListTeams(authClient as OrganizationTeamsAuthClient, {
    query: { organizationId: activeOrganization?.id },
    enabled: teamsEnabled
  })
  const invitations = useListOrganizationInvitations(authClient)
  const canInvite = useHasPermission(authClient, {
    organizationId: activeOrganization?.id,
    permissions: { invitation: ["create"] }
  })
  const canReadRoles = useHasPermission(authClient, {
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

  const atInvitationLimit =
    invitationLimit !== undefined &&
    (invitations.data?.filter((invitation) => invitation.status === "pending")
      .length ?? 0) >= invitationLimit

  const form = useAuthForm({
    defaultValues: {
      additionalFields: getAdditionalFieldDefaultValues(invitationFields),
      email: "",
      roles: [] as string[],
      teamId: ""
    },
    onSubmit: async ({ value }) => {
      if (
        !activeOrganizationId ||
        !canInvite.data?.success ||
        value.roles.length === 0 ||
        atInvitationLimit
      )
        return

      const teamId = teams.data?.some((team) => team.id === value.teamId)
        ? value.teamId
        : undefined

      try {
        await inviteMember({
          ...getAdditionalFieldSubmitValues(
            invitationFields,
            value.additionalFields
          ),
          email: value.email.trim(),
          organizationId: activeOrganizationId,
          role: value.roles as Parameters<typeof inviteMember>[0]["role"],
          teamId
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

    if (open || organizationChanged) {
      const fallback = pickDefaultRole(Object.keys(assignableRoles))
      form.reset({
        additionalFields: getAdditionalFieldDefaultValues(invitationFields),
        email: "",
        roles: fallback ? [fallback] : [],
        teamId: ""
      })
    }
    previousOrganizationId.current = activeOrganizationId
  }, [activeOrganizationId, assignableRoles, form, invitationFields, open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form.AppForm>
          <form.AuthFormRoot className="flex flex-col gap-6">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus />
                {organizationLocalization.inviteMember}
              </DialogTitle>

              <DialogDescription>
                {organizationLocalization.inviteMemberDescription}
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-4">
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
                {(field) => {
                  const isInvalid = isAuthFormFieldInvalid(field.state.meta)

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor="invite-member-email">
                        {localization.auth.email}
                      </FieldLabel>
                      <Input
                        id="invite-member-email"
                        name={field.name}
                        type="email"
                        autoFocus
                        placeholder={localization.auth.email}
                        disabled={isInviting}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        aria-invalid={isInvalid}
                      />
                      <field.AuthFormFieldError />
                    </Field>
                  )
                }}
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
                {(field) => {
                  const selectedRoles = field.state.value
                  const roleSummary = selectedRoles
                    .map((entry) => assignableRoles[entry] ?? entry)
                    .join(", ")
                  const toggleRole = (role: string) =>
                    field.handleChange(
                      selectedRoles.includes(role)
                        ? selectedRoles.filter((entry) => entry !== role)
                        : [...selectedRoles, role]
                    )

                  return (
                    <Field
                      data-invalid={isAuthFormFieldInvalid(field.state.meta)}
                    >
                      <FieldLabel htmlFor="invite-member-role">
                        {organizationLocalization.role}
                      </FieldLabel>
                      {allowMultipleRoles ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            id="invite-member-role"
                            disabled={isInviting}
                            className={cn(
                              buttonVariants({ variant: "outline" }),
                              "w-full justify-between font-normal"
                            )}
                          >
                            <span
                              className={cn(
                                !roleSummary && "text-muted-foreground"
                              )}
                            >
                              {roleSummary ||
                                organizationLocalization.selectRoles}
                            </span>
                            <ChevronDown className="opacity-50" />
                          </DropdownMenuTrigger>

                          <DropdownMenuContent
                            align="start"
                            className="w-(--radix-dropdown-menu-trigger-width)"
                          >
                            {Object.entries(assignableRoles).map(
                              ([key, label]) => {
                                const checked = selectedRoles.includes(key)

                                return (
                                  <DropdownMenuCheckboxItem
                                    key={key}
                                    checked={checked}
                                    disabled={
                                      checked && selectedRoles.length === 1
                                    }
                                    onSelect={(event) => {
                                      event.preventDefault()
                                      toggleRole(key)
                                    }}
                                  >
                                    {label}
                                  </DropdownMenuCheckboxItem>
                                )
                              }
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <Select
                          disabled={isInviting}
                          onValueChange={(role) => field.handleChange([role])}
                          value={selectedRoles[0] ?? ""}
                        >
                          <SelectTrigger
                            id="invite-member-role"
                            className="w-full"
                          >
                            <SelectValue
                              placeholder={organizationLocalization.selectRoles}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {Object.entries(assignableRoles).map(
                                ([key, label]) => (
                                  <SelectItem key={key} value={key}>
                                    {label}
                                  </SelectItem>
                                )
                              )}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      )}
                      <field.AuthFormFieldError />
                    </Field>
                  )
                }}
              </form.AppField>

              {teamsEnabled && (
                <form.AppField name="teamId">
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor="invite-member-team">
                        {organizationLocalization.team}
                      </FieldLabel>
                      <Select
                        value={field.state.value}
                        onValueChange={(value) =>
                          field.handleChange(value ?? "")
                        }
                        disabled={isInviting}
                      >
                        <SelectTrigger
                          id="invite-member-team"
                          className="w-full"
                        >
                          <SelectValue
                            placeholder={organizationLocalization.selectTeam}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {teams.data?.map((team) => (
                            <SelectItem key={team.id} value={team.id}>
                              {team.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
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
            </div>

            <DialogFooter>
              <DialogClose
                className={buttonVariants({ variant: "outline" })}
                disabled={isInviting}
                type="button"
              >
                {localization.settings.cancel}
              </DialogClose>

              <form.AuthFormSubmitButton
                disabled={
                  isInviting ||
                  atInvitationLimit ||
                  canInvite.isPending ||
                  !canInvite.data?.success
                }
              >
                {organizationLocalization.inviteMember}
              </form.AuthFormSubmitButton>
            </DialogFooter>
          </form.AuthFormRoot>
        </form.AppForm>
      </DialogContent>
    </Dialog>
  )
}
