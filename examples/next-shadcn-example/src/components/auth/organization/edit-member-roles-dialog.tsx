"use client"

import { validateMinimumItems } from "@better-auth-ui/core"
import type { OrganizationAuthClient } from "@better-auth-ui/core/plugins/organization"
import { parseMemberRoles } from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useUpdateMemberRole } from "@better-auth-ui/react/plugins/organization"
import { ShieldCheck } from "lucide-react"
import { useEffect } from "react"
import { toast } from "sonner"
import { Button, buttonVariants } from "@/components/ui/button"
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
import {
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle
} from "@/components/ui/field"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Spinner } from "@/components/ui/spinner"
import { organizationPlugin } from "@/lib/auth/organization-plugin"
import { useAuthForm } from "../auth-form"

export type EditMemberRolesDialogProps = {
  member: {
    id: string
    role?: string | null
  }
  onOpenChange: (open: boolean) => void
  open: boolean
  organizationId: string
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

export function EditMemberRolesDialog({
  member,
  onOpenChange,
  open,
  organizationId,
  roles,
  protectedRole,
  protectedRoleRemovalDisabled
}: EditMemberRolesDialogProps) {
  const { authClient, localization } = useAuth<OrganizationAuthClient>()
  const { allowMultipleRoles, localization: organizationLocalization } =
    useAuthPlugin(organizationPlugin)
  const { mutate: updateMemberRole, isPending } = useUpdateMemberRole(
    authClient,
    {
      onSuccess: () => {
        toast.success(organizationLocalization.memberRoleUpdated)
        onOpenChange(false)
      }
    }
  )
  const form = useAuthForm({
    defaultValues: {
      roles: selectedMemberRoles(member.role, allowMultipleRoles, protectedRole)
    },
    onSubmit: ({ value }) => {
      if (value.roles.length === 0) return

      updateMemberRole({
        memberId: member.id,
        organizationId,
        role: value.roles
      })
    }
  })

  useEffect(() => {
    if (open)
      form.reset({
        roles: selectedMemberRoles(
          member.role,
          allowMultipleRoles,
          protectedRole
        )
      })
  }, [allowMultipleRoles, form.reset, member.role, open, protectedRole])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form
          className="flex flex-col gap-6"
          onSubmit={(event) => {
            event.preventDefault()
            void form.handleSubmit()
          }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck />
              {organizationLocalization.changeMemberRole}
            </DialogTitle>
            <DialogDescription>
              {organizationLocalization.changeMemberRoleDescription}
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
                  organizationLocalization.selectAtLeastOneRole
                )
            }}
          >
            {(field) => {
              const selectedRoles = field.state.value
              const protectedRoleSelected =
                !allowMultipleRoles &&
                protectedRoleRemovalDisabled &&
                protectedRole !== undefined &&
                selectedRoles.includes(protectedRole)
              const roleOptions = roles.map(([role, label]) => {
                const checked = selectedRoles.includes(role)
                const disabled =
                  isPending ||
                  (allowMultipleRoles &&
                    checked &&
                    selectedRoles.length === 1) ||
                  (protectedRoleSelected && role !== protectedRole) ||
                  (role === protectedRole &&
                    checked &&
                    protectedRoleRemovalDisabled)
                const id = `member-${member.id}-role-${role}`

                return (
                  <FieldLabel htmlFor={id} key={role}>
                    <Field orientation="horizontal" data-disabled={disabled}>
                      <FieldContent>
                        <FieldTitle>{label}</FieldTitle>
                      </FieldContent>
                      {allowMultipleRoles ? (
                        <Checkbox
                          checked={checked}
                          disabled={disabled}
                          id={id}
                          onCheckedChange={(next) => {
                            if (next === true && !checked) {
                              field.pushValue(role)
                              return
                            }

                            const index = selectedRoles.indexOf(role)
                            if (index >= 0) field.removeValue(index)
                          }}
                        />
                      ) : (
                        <RadioGroupItem
                          disabled={disabled}
                          id={id}
                          value={role}
                        />
                      )}
                    </Field>
                  </FieldLabel>
                )
              })

              return (
                <>
                  {allowMultipleRoles ? (
                    <FieldSet>
                      <FieldLegend className="sr-only" variant="label">
                        {organizationLocalization.changeMemberRole}
                      </FieldLegend>
                      <FieldGroup className="gap-2">{roleOptions}</FieldGroup>
                    </FieldSet>
                  ) : (
                    <RadioGroup
                      disabled={isPending}
                      onValueChange={(role) => field.handleChange([role])}
                      value={selectedRoles[0] ?? ""}
                    >
                      {roleOptions}
                    </RadioGroup>
                  )}

                  <field.AuthFormFieldError />

                  <DialogFooter>
                    <DialogClose
                      className={buttonVariants({ variant: "outline" })}
                      disabled={isPending}
                      type="button"
                    >
                      {localization.settings.cancel}
                    </DialogClose>
                    <form.Subscribe
                      selector={(state) =>
                        [state.canSubmit, state.isSubmitting] as const
                      }
                    >
                      {([canSubmit, isSubmitting]) => (
                        <Button
                          disabled={isPending || isSubmitting || !canSubmit}
                          type="submit"
                        >
                          {isPending && <Spinner />}
                          {localization.settings.saveChanges}
                        </Button>
                      )}
                    </form.Subscribe>
                  </DialogFooter>
                </>
              )
            }}
          </form.AppField>
        </form>
      </DialogContent>
    </Dialog>
  )
}
