import {
  type OrganizationAuthClient,
  parseMemberRoles
} from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useUpdateMemberRole } from "@better-auth-ui/react/plugins/organization"
import { ShieldCheck } from "@gravity-ui/icons"
import {
  AlertDialog,
  Button,
  Checkbox,
  Form,
  Radio,
  RadioGroup,
  Spinner,
  toast
} from "@heroui/react"
import { useForm } from "@tanstack/react-form"
import { useEffect } from "react"

import { organizationPlugin } from "../../../lib/auth/organization-plugin"

export type EditMemberRolesDialogProps = {
  isOpen: boolean
  member: {
    id: string
    role?: string | null
  }
  onOpenChange: (open: boolean) => void
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
  isOpen,
  member,
  onOpenChange,
  organizationId,
  roles,
  protectedRole,
  protectedRoleRemovalDisabled
}: EditMemberRolesDialogProps) {
  const { authClient, localization } = useAuth()
  const { allowMultipleRoles, localization: organizationLocalization } =
    useAuthPlugin(organizationPlugin)
  const updateMemberRole = useUpdateMemberRole(
    authClient as OrganizationAuthClient,
    {
      onSuccess: () => {
        toast.success(organizationLocalization.memberRoleUpdated)
        onOpenChange(false)
      }
    }
  )
  const form = useForm({
    defaultValues: {
      roles: selectedMemberRoles(member.role, allowMultipleRoles, protectedRole)
    },
    onSubmit: ({ value }) => {
      if (value.roles.length === 0) return

      updateMemberRole.mutate({
        memberId: member.id,
        organizationId,
        role: value.roles
      })
    }
  })

  useEffect(() => {
    if (isOpen)
      form.reset({
        roles: selectedMemberRoles(
          member.role,
          allowMultipleRoles,
          protectedRole
        )
      })
  }, [allowMultipleRoles, form.reset, isOpen, member.role, protectedRole])

  return (
    <AlertDialog.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <AlertDialog.Container>
        <AlertDialog.Dialog>
          <Form
            onSubmit={(event) => {
              event.preventDefault()
              void form.handleSubmit()
            }}
          >
            <AlertDialog.CloseTrigger />
            <AlertDialog.Header>
              <AlertDialog.Heading className="flex items-center gap-2">
                <ShieldCheck />
                {organizationLocalization.changeMemberRole}
              </AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body className="flex flex-col gap-4">
              <p className="text-muted text-sm">
                {organizationLocalization.changeMemberRoleDescription}
              </p>
              <form.Subscribe selector={(state) => state.values.roles}>
                {(selectedRoles) => {
                  const protectedRoleSelected =
                    !allowMultipleRoles &&
                    protectedRoleRemovalDisabled &&
                    protectedRole !== undefined &&
                    selectedRoles.includes(protectedRole)

                  return allowMultipleRoles ? (
                    <fieldset className="flex flex-col gap-2">
                      <legend className="sr-only">
                        {organizationLocalization.changeMemberRole}
                      </legend>
                      {roles.map(([role, label]) => {
                        const selected = selectedRoles.includes(role)
                        const disabled =
                          updateMemberRole.isPending ||
                          (selected && selectedRoles.length === 1) ||
                          (role === protectedRole &&
                            selected &&
                            protectedRoleRemovalDisabled)

                        return (
                          <Checkbox
                            className="w-full rounded-lg border p-3"
                            isDisabled={disabled}
                            isSelected={selected}
                            key={role}
                            onChange={(checked) =>
                              form.setFieldValue("roles", (current) =>
                                checked
                                  ? current.includes(role)
                                    ? current
                                    : [...current, role]
                                  : current.filter((entry) => entry !== role)
                              )
                            }
                            variant="secondary"
                          >
                            <Checkbox.Content className="w-full">
                              <Checkbox.Control>
                                <Checkbox.Indicator />
                              </Checkbox.Control>
                              <span className="font-medium text-sm">
                                {label}
                              </span>
                            </Checkbox.Content>
                          </Checkbox>
                        )
                      })}
                    </fieldset>
                  ) : (
                    <RadioGroup
                      aria-label={organizationLocalization.changeMemberRole}
                      isDisabled={updateMemberRole.isPending}
                      onChange={(role) => form.setFieldValue("roles", [role])}
                      value={selectedRoles[0] ?? ""}
                      variant="secondary"
                    >
                      <div className="flex flex-col gap-2">
                        {roles.map(([role, label]) => {
                          const selected = selectedRoles.includes(role)
                          const disabled =
                            (protectedRoleSelected && role !== protectedRole) ||
                            (role === protectedRole &&
                              selected &&
                              protectedRoleRemovalDisabled)

                          return (
                            <Radio
                              className="w-full rounded-lg border p-3"
                              isDisabled={disabled}
                              key={role}
                              value={role}
                            >
                              <Radio.Content className="w-full">
                                <Radio.Control>
                                  <Radio.Indicator />
                                </Radio.Control>
                                <span className="font-medium text-sm">
                                  {label}
                                </span>
                              </Radio.Content>
                            </Radio>
                          )
                        })}
                      </div>
                    </RadioGroup>
                  )
                }}
              </form.Subscribe>
            </AlertDialog.Body>
            <AlertDialog.Footer>
              <Button
                isDisabled={updateMemberRole.isPending}
                slot="close"
                variant="tertiary"
              >
                {localization.settings.cancel}
              </Button>
              <form.Subscribe selector={(state) => state.values.roles.length}>
                {(selectedRoleCount) => (
                  <Button
                    isDisabled={
                      updateMemberRole.isPending || selectedRoleCount === 0
                    }
                    isPending={updateMemberRole.isPending}
                    type="submit"
                  >
                    {updateMemberRole.isPending && (
                      <Spinner color="current" size="sm" />
                    )}
                    {localization.settings.saveChanges}
                  </Button>
                )}
              </form.Subscribe>
            </AlertDialog.Footer>
          </Form>
        </AlertDialog.Dialog>
      </AlertDialog.Container>
    </AlertDialog.Backdrop>
  )
}
