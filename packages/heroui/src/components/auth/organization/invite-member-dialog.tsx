import type { OrganizationAuthClient } from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useInviteMember } from "@better-auth-ui/react/plugins/organization"
import { PersonPlus } from "@gravity-ui/icons"
import {
  AlertDialog,
  Button,
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
import { type SyntheticEvent, useEffect, useState } from "react"

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
  const { localization: organizationLocalization, roles } =
    useAuthPlugin(organizationPlugin)

  const [role, setRole] = useState(() => pickDefaultRole(Object.keys(roles)))

  useEffect(() => {
    setRole((current) => {
      const keys = Object.keys(roles)
      return keys.includes(current) ? current : pickDefaultRole(keys)
    })
  }, [roles])

  const { mutate: inviteMember, isPending: isInviting } = useInviteMember(
    authClient as OrganizationAuthClient,
    {
      onSuccess: () => {
        onOpenChange(false)
        toast.success(organizationLocalization.inviteMemberSuccess)
      }
    }
  )

  const isRoleValid = Object.keys(roles).includes(role)

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!isRoleValid) return

    const formData = new FormData(e.target as HTMLFormElement)
    const email = formData.get("email") as string

    inviteMember({
      email: email.trim(),
      role: role as Parameters<typeof inviteMember>[0]["role"]
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
                value={role}
                onChange={(value) => {
                  if (typeof value === "string") setRole(value)
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
                  <ListBox>
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
            </AlertDialog.Body>

            <AlertDialog.Footer>
              <Button slot="close" variant="tertiary" isDisabled={isInviting}>
                {localization.settings.cancel}
              </Button>

              <Button
                type="submit"
                isPending={isInviting}
                isDisabled={!isRoleValid}
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
