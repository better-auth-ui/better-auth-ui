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
  Spinner,
  toast
} from "@heroui/react"
import { type FormEvent, useEffect, useState } from "react"

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
  const { localization: organizationLocalization } =
    useAuthPlugin(organizationPlugin)
  const [selectedRoles, setSelectedRoles] = useState(() =>
    parseMemberRoles(member.role)
  )
  const updateMemberRole = useUpdateMemberRole(
    authClient as OrganizationAuthClient,
    {
      onSuccess: () => {
        toast.success(organizationLocalization.memberRoleUpdated)
        onOpenChange(false)
      }
    }
  )

  useEffect(() => {
    if (isOpen) setSelectedRoles(parseMemberRoles(member.role))
  }, [isOpen, member.role])

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (selectedRoles.length === 0) return

    updateMemberRole.mutate({
      memberId: member.id,
      organizationId,
      role: selectedRoles
    })
  }

  return (
    <AlertDialog.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <AlertDialog.Container>
        <AlertDialog.Dialog>
          <Form onSubmit={submit}>
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
                        setSelectedRoles((current) =>
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
                        <span className="font-medium text-sm">{label}</span>
                      </Checkbox.Content>
                    </Checkbox>
                  )
                })}
              </fieldset>
            </AlertDialog.Body>
            <AlertDialog.Footer>
              <Button
                isDisabled={updateMemberRole.isPending}
                slot="close"
                variant="tertiary"
              >
                {localization.settings.cancel}
              </Button>
              <Button
                isDisabled={
                  updateMemberRole.isPending || selectedRoles.length === 0
                }
                isPending={updateMemberRole.isPending}
                type="submit"
              >
                {updateMemberRole.isPending && (
                  <Spinner color="current" size="sm" />
                )}
                {localization.settings.saveChanges}
              </Button>
            </AlertDialog.Footer>
          </Form>
        </AlertDialog.Dialog>
      </AlertDialog.Container>
    </AlertDialog.Backdrop>
  )
}
