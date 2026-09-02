import {
  getAdditionalFieldDefaultValues,
  getAdditionalFieldSubmitValues,
  getFormFieldErrors,
  validateEmailAddress
} from "@better-auth-ui/core"
import type {
  InviteMemberParams,
  OrganizationAuthClient,
  OrganizationRolesAuthClient,
  OrganizationTeamsAuthClient
} from "@better-auth-ui/core/plugins/organization"
import { mergeOrganizationRoleLabels } from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin } from "@better-auth-ui/solid"
import {
  useActiveOrganization,
  useHasPermission,
  useInviteMember,
  useListOrganizationInvitations,
  useListRoles,
  useListTeams
} from "@better-auth-ui/solid/plugins/organization"
import { createEffect, createMemo, For, Show } from "solid-js"
import { toast } from "solid-sonner"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { organizationPlugin } from "@/lib/auth/organization-plugin"
import {
  createAuthForm,
  getAuthAdditionalFieldValidators,
  isAuthFormFieldInvalid
} from "../auth-form"

export type InviteMemberDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function pickDefaultRole(roles: Record<string, string>) {
  const roleKeys = Object.keys(roles)

  if (roleKeys.includes("member")) return "member"

  return roleKeys.at(-1) ?? ""
}

export function InviteMemberDialog(props: InviteMemberDialogProps) {
  const auth = useAuth<OrganizationAuthClient>()
  const activeOrganization = useActiveOrganization(auth.authClient)
  const config = useAuthPlugin(organizationPlugin)
  const canInvite = useHasPermission(auth.authClient, () => ({
    organizationId: activeOrganization.data?.id,
    permissions: { invitation: ["create"] }
  }))
  const canReadRoles = useHasPermission(auth.authClient, () => ({
    organizationId: activeOrganization.data?.id,
    permissions: { ac: ["read"] }
  }))
  const dynamicRoles = useListRoles(
    auth.authClient as OrganizationRolesAuthClient,
    () => ({
      query: { organizationId: activeOrganization.data?.id },
      enabled:
        config.dynamicAccessControl?.enabled === true &&
        canReadRoles.data?.success === true
    })
  )
  const roles = createMemo(() =>
    mergeOrganizationRoleLabels(config.roles, dynamicRoles.data)
  )
  const teams = useListTeams(
    auth.authClient as OrganizationTeamsAuthClient,
    () => ({
      query: { organizationId: activeOrganization.data?.id },
      enabled: config.teams
    })
  )
  const invitations = useListOrganizationInvitations(auth.authClient)
  const inviteMember = useInviteMember(
    auth.authClient as OrganizationTeamsAuthClient,
    () => ({
      onSuccess: () => {
        props.onOpenChange(false)
        toast.success(config.localization.inviteMemberSuccess)
      }
    })
  )

  const invitationLimitReached = createMemo(
    () =>
      config.invitationLimit !== undefined &&
      (invitations.data?.filter((invitation) => invitation.status === "pending")
        .length ?? 0) >= config.invitationLimit
  )
  const form = createAuthForm(() => ({
    defaultValues: {
      additionalFields: getAdditionalFieldDefaultValues(
        config.modelFields.invitation
      ),
      email: "",
      roles: [] as string[],
      teamId: ""
    },
    onSubmit: async ({ value }) => {
      const organizationId = activeOrganization.data?.id
      const teamId = teams.data?.some((team) => team.id === value.teamId)
        ? value.teamId
        : undefined

      if (
        !organizationId ||
        !canInvite.data?.success ||
        value.roles.length === 0 ||
        invitationLimitReached()
      )
        return

      const payload = {
        ...getAdditionalFieldSubmitValues(
          config.modelFields.invitation,
          value.additionalFields
        ),
        email: value.email.trim(),
        organizationId,
        teamId,
        role: value.roles as InviteMemberParams["role"]
      } satisfies InviteMemberParams<OrganizationTeamsAuthClient>

      try {
        await inviteMember.mutateAsync(payload)
      } catch {
        // The mutation reports the error through its configured handler.
      }
    }
  }))

  createEffect(() => {
    if (!props.open) {
      form.reset({
        additionalFields: getAdditionalFieldDefaultValues(
          config.modelFields.invitation
        ),
        email: "",
        roles: [pickDefaultRole(roles())].filter(Boolean),
        teamId: ""
      })
      return
    }

    const available = roles()
    const current = form.getFieldValue("roles")
    const kept = current.filter((entry) => entry in available)
    const allowed = config.allowMultipleRoles ? kept : kept.slice(0, 1)
    const next =
      allowed.length > 0
        ? allowed
        : [pickDefaultRole(available)].filter(Boolean)

    if (
      next.length !== current.length ||
      next.some((role, index) => role !== current[index])
    ) {
      form.setFieldValue("roles", next)
    }
  })

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent>
        <form.AppForm>
          <form.AuthFormRoot class="flex flex-col gap-6">
            <DialogHeader>
              <DialogTitle>{config.localization.inviteMember}</DialogTitle>
              <DialogDescription>
                {config.localization.inviteMemberDescription}
              </DialogDescription>
            </DialogHeader>

            <form.AppField
              name="email"
              validators={{
                onChange: ({ value }) =>
                  validateEmailAddress(value, {
                    invalidMessage: auth.localization.auth.invalidEmail,
                    requiredMessage: auth.localization.auth.fieldRequired
                  })
              }}
            >
              {(field) => {
                const isInvalid = () =>
                  isAuthFormFieldInvalid(field().state.meta)
                return (
                  <Field data-invalid={isInvalid()}>
                    <FieldLabel for="invite-member-email">
                      {auth.localization.auth.email}
                    </FieldLabel>
                    <Input
                      aria-invalid={isInvalid()}
                      autofocus
                      disabled={inviteMember.isPending}
                      id="invite-member-email"
                      name={field().name}
                      onBlur={field().handleBlur}
                      onInput={(event) =>
                        field().handleChange(event.currentTarget.value)
                      }
                      type="email"
                      value={field().state.value}
                    />
                    <FieldError
                      errors={getFormFieldErrors(field().state.meta.errors)}
                    />
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
                    : auth.localization.auth.fieldRequired
              }}
            >
              {(field) => (
                <Show
                  when={config.allowMultipleRoles}
                  fallback={
                    <Field>
                      <FieldLabel for="invite-member-role">
                        {config.localization.role}
                      </FieldLabel>
                      <NativeSelect
                        class="w-full"
                        disabled={inviteMember.isPending}
                        id="invite-member-role"
                        onBlur={field().handleBlur}
                        onChange={(event) =>
                          field().handleChange([event.currentTarget.value])
                        }
                        value={field().state.value[0] ?? ""}
                      >
                        <For each={Object.entries(roles())}>
                          {([value, label]) => (
                            <NativeSelectOption value={value}>
                              {label}
                            </NativeSelectOption>
                          )}
                        </For>
                      </NativeSelect>
                    </Field>
                  }
                >
                  <fieldset class="flex flex-col gap-2">
                    <legend class="font-medium text-sm">
                      {config.localization.role}
                    </legend>
                    <div class="flex flex-wrap gap-4">
                      <For each={Object.entries(roles())}>
                        {([value, label]) => (
                          <Field orientation="horizontal">
                            <Checkbox
                              checked={field().state.value.includes(value)}
                              disabled={inviteMember.isPending}
                              id={`invite-member-role-${value}`}
                              onChange={(selected) => {
                                const current = field().state.value
                                const next = selected
                                  ? [...current, value]
                                  : current.filter((entry) => entry !== value)
                                if (next.length > 0) field().handleChange(next)
                              }}
                            />
                            <FieldLabel for={`invite-member-role-${value}`}>
                              {label}
                            </FieldLabel>
                          </Field>
                        )}
                      </For>
                    </div>
                  </fieldset>
                </Show>
              )}
            </form.AppField>

            <Show when={config.teams}>
              <form.AppField name="teamId">
                {(field) => (
                  <Field>
                    <FieldLabel for="invite-member-team">
                      {config.localization.team}
                    </FieldLabel>
                    <NativeSelect
                      class="w-full"
                      disabled={inviteMember.isPending}
                      id="invite-member-team"
                      onBlur={field().handleBlur}
                      onChange={(event) =>
                        field().handleChange(event.currentTarget.value)
                      }
                      value={field().state.value}
                    >
                      <NativeSelectOption value="">
                        {config.localization.selectTeam}
                      </NativeSelectOption>
                      <For each={teams.data}>
                        {(team) => (
                          <NativeSelectOption value={team.id}>
                            {team.name}
                          </NativeSelectOption>
                        )}
                      </For>
                    </NativeSelect>
                  </Field>
                )}
              </form.AppField>
            </Show>

            <For each={config.modelFields.invitation}>
              {(configuredField) => (
                <form.AppField
                  name={`additionalFields.${configuredField.name}`}
                  validators={getAuthAdditionalFieldValidators(
                    configuredField,
                    auth.localization.auth.fieldRequired
                  )}
                >
                  {(field) => (
                    <field.AuthFormAdditionalField
                      field={configuredField}
                      isPending={inviteMember.isPending}
                      optionalLabel={auth.localization.settings.optional}
                    />
                  )}
                </form.AppField>
              )}
            </For>

            <DialogFooter>
              <DialogClose
                as={Button}
                disabled={inviteMember.isPending}
                type="button"
                variant="outline"
              >
                {auth.localization.settings.cancel}
              </DialogClose>
              <form.AuthFormSubmitButton
                disabled={
                  inviteMember.isPending ||
                  canInvite.isPending ||
                  !canInvite.data?.success ||
                  invitationLimitReached()
                }
              >
                {config.localization.inviteMember}
              </form.AuthFormSubmitButton>
            </DialogFooter>
          </form.AuthFormRoot>
        </form.AppForm>
      </DialogContent>
    </Dialog>
  )
}
