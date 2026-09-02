import { getFormFieldErrors, validateMinimumItems } from "@better-auth-ui/core"
import {
  type OrganizationAuthClient,
  type OrganizationLocalization,
  parseMemberRoles,
  type UpdateMemberRoleParams
} from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin } from "@better-auth-ui/solid"
import { useUpdateMemberRole } from "@better-auth-ui/solid/plugins/organization"
import { ShieldCheck } from "lucide-solid"
import { createEffect, For, Show } from "solid-js"
import { toast } from "solid-sonner"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
  FieldTitle
} from "@/components/ui/field"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { organizationPlugin } from "@/lib/auth/organization-plugin"
import { createAuthForm } from "../auth-form"

type EditMemberRolesLocalization = Pick<
  OrganizationLocalization,
  | "changeMemberRole"
  | "changeMemberRoleDescription"
  | "memberRoleUpdated"
  | "selectAtLeastOneRole"
>

export type EditMemberRolesDialogProps = {
  localization: EditMemberRolesLocalization
  member: {
    id: string
    organizationId: string
    role?: string | null
  }
  onOpenChange: (open: boolean) => void
  open: boolean
  roles: Array<[string, string]>
  protectedRole?: string
  protectedRoleRemovalDisabled?: boolean
}

const selectedMemberRoles = (
  memberRole: string | null | undefined,
  allowMultipleRoles: boolean,
  protectedRole?: string
) => {
  const parsedRoles = parseMemberRoles(memberRole)

  if (allowMultipleRoles) return parsedRoles

  const selectedRole =
    protectedRole && parsedRoles.includes(protectedRole)
      ? protectedRole
      : parsedRoles[0]

  return selectedRole ? [selectedRole] : []
}

export function EditMemberRolesDialog(props: EditMemberRolesDialogProps) {
  const auth = useAuth<OrganizationAuthClient>()
  const config = useAuthPlugin(organizationPlugin)
  const updateMemberRole = useUpdateMemberRole(auth.authClient, () => ({
    onSuccess: () => {
      toast.success(props.localization.memberRoleUpdated)
      props.onOpenChange(false)
    }
  }))
  const form = createAuthForm(() => ({
    defaultValues: {
      roles: selectedMemberRoles(
        props.member.role,
        config.allowMultipleRoles,
        props.protectedRole
      )
    },
    onSubmit: async ({ value }) => {
      if (value.roles.length === 0) return

      try {
        await updateMemberRole.mutateAsync({
          memberId: props.member.id,
          organizationId: props.member.organizationId,
          role: value.roles as UpdateMemberRoleParams["role"]
        })
      } catch {
        // The mutation reports the error through its configured handler.
      }
    }
  }))

  createEffect(() => {
    if (props.open)
      form.reset({
        roles: selectedMemberRoles(
          props.member.role,
          config.allowMultipleRoles,
          props.protectedRole
        )
      })
  })

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent>
        <form.AppForm>
          <form.AuthFormRoot class="flex flex-col gap-6">
            <DialogHeader>
              <DialogTitle class="flex items-center gap-2">
                <ShieldCheck class="size-4" />
                {props.localization.changeMemberRole}
              </DialogTitle>
              <DialogDescription>
                {props.localization.changeMemberRoleDescription}
              </DialogDescription>
            </DialogHeader>

            <form.AppField
              name="roles"
              mode="array"
              validators={{
                onChange: ({ value }) =>
                  validateMinimumItems(
                    value,
                    1,
                    props.localization.selectAtLeastOneRole
                  )
              }}
            >
              {(field) => {
                const selectedRoles = () => field().state.value
                const protectedRoleSelected = () =>
                  !config.allowMultipleRoles &&
                  props.protectedRoleRemovalDisabled &&
                  props.protectedRole !== undefined &&
                  selectedRoles().includes(props.protectedRole)

                return (
                  <>
                    <Show
                      when={config.allowMultipleRoles}
                      fallback={
                        <RadioGroup
                          disabled={updateMemberRole.isPending}
                          onChange={(role) => field().handleChange([role])}
                          value={selectedRoles()[0] ?? ""}
                        >
                          <div class="flex flex-col gap-2">
                            <For each={props.roles}>
                              {([role, label]) => {
                                const selected = () =>
                                  selectedRoles().includes(role)
                                const disabled = () =>
                                  (protectedRoleSelected() &&
                                    role !== props.protectedRole) ||
                                  (role === props.protectedRole &&
                                    selected() &&
                                    props.protectedRoleRemovalDisabled)
                                const id = `member-${props.member.id}-role-${role}`

                                return (
                                  <FieldLabel for={id}>
                                    <Field
                                      data-disabled={disabled() || undefined}
                                      orientation="horizontal"
                                    >
                                      <FieldContent>
                                        <FieldTitle>{label}</FieldTitle>
                                      </FieldContent>
                                      <RadioGroupItem
                                        disabled={disabled()}
                                        id={id}
                                        value={role}
                                      />
                                    </Field>
                                  </FieldLabel>
                                )
                              }}
                            </For>
                          </div>
                        </RadioGroup>
                      }
                    >
                      <div class="flex flex-col gap-2">
                        <For each={props.roles}>
                          {([role, label]) => {
                            const checked = () => selectedRoles().includes(role)
                            const disabled = () =>
                              updateMemberRole.isPending ||
                              (checked() && selectedRoles().length === 1) ||
                              (role === props.protectedRole &&
                                checked() &&
                                props.protectedRoleRemovalDisabled)
                            const id = `member-${props.member.id}-role-${role}`

                            return (
                              <FieldLabel for={id}>
                                <Field
                                  data-disabled={disabled() || undefined}
                                  orientation="horizontal"
                                >
                                  <FieldContent>
                                    <FieldTitle>{label}</FieldTitle>
                                  </FieldContent>
                                  <Checkbox
                                    checked={checked()}
                                    disabled={disabled()}
                                    id={id}
                                    onChange={(selected) => {
                                      if (selected && !checked()) {
                                        field().pushValue(role)
                                        return
                                      }

                                      const index =
                                        selectedRoles().indexOf(role)
                                      if (index >= 0) field().removeValue(index)
                                    }}
                                  />
                                </Field>
                              </FieldLabel>
                            )
                          }}
                        </For>
                      </div>
                    </Show>

                    <FieldError
                      errors={getFormFieldErrors(field().state.meta.errors)}
                    />

                    <DialogFooter>
                      <Button
                        disabled={updateMemberRole.isPending}
                        onClick={() => props.onOpenChange(false)}
                        type="button"
                        variant="outline"
                      >
                        {auth.localization.settings.cancel}
                      </Button>
                      <form.AuthFormSubmitButton
                        disabled={updateMemberRole.isPending}
                      >
                        {auth.localization.settings.saveChanges}
                      </form.AuthFormSubmitButton>
                    </DialogFooter>
                  </>
                )
              }}
            </form.AppField>
          </form.AuthFormRoot>
        </form.AppForm>
      </DialogContent>
    </Dialog>
  )
}
