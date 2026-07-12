import {
  type OrganizationAuthClient,
  useAuth,
  useAuthPlugin,
  useInviteMember
} from "@better-auth-ui/react"
import { useEffect, useState } from "react"
import { Text, View } from "react-native"

import { organizationPlugin } from "../../../lib/auth/organization-plugin"
import { useThemeColors } from "../../../lib/theme-colors"
import { AlertDialog } from "../../../primitives/alert-dialog"
import { Button } from "../../../primitives/button"
import { FieldError, Label, TextField } from "../../../primitives/field"
import { Form } from "../../../primitives/form"
import { Input } from "../../../primitives/input"
import { Menu } from "../../../primitives/menu"
import { toast } from "../../../primitives/toast"
import { ChevronDown, PersonPlus } from "../../../primitives/ui-icons"

/** Props for the {@link InviteMemberDialog} component. */
export type InviteMemberDialogProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

const pickDefaultRole = (keys: string[]) =>
  keys.includes("member") ? "member" : (keys.at(-1) ?? "")

/**
 * Render a dialog for inviting a member to the organization. Mirrors the
 * heroui `InviteMemberDialog`, adapted for React Native: the web `Select` +
 * `ListBox` role picker becomes a labeled trigger that opens the RN `Menu`
 * bottom sheet (same pattern already used by `organization-members.tsx`'s
 * role-filter/role-change menus), and the email field is controlled state
 * submitted through the RN `Form` coordinator instead of `FormData`.
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
  const colors = useThemeColors()

  const [email, setEmail] = useState("")
  const [role, setRole] = useState(() => pickDefaultRole(Object.keys(roles)))
  const [roleMenuOpen, setRoleMenuOpen] = useState(false)

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
  const roleLabel = roles?.[role] ?? role

  const handleSubmit = () => {
    if (!isRoleValid) return

    inviteMember({
      email: email.trim(),
      role: role as Parameters<typeof inviteMember>[0]["role"]
    })
  }

  return (
    <AlertDialog isOpen={isOpen} onOpenChange={onOpenChange}>
      <AlertDialog.CloseTrigger />

      <AlertDialog.Header>
        <AlertDialog.Icon status="default">
          <PersonPlus width={20} height={20} color={colors.foreground} />
        </AlertDialog.Icon>

        <AlertDialog.Heading>
          {organizationLocalization.inviteMember}
        </AlertDialog.Heading>
      </AlertDialog.Header>

      <Form onSubmit={handleSubmit} className="gap-4">
        <AlertDialog.Body className="gap-4">
          <Text className="text-sm text-muted">
            {organizationLocalization.inviteMemberDescription}
          </Text>

          <TextField
            name="email"
            type="email"
            autoComplete="email"
            isDisabled={isInviting}
            value={email}
            onChange={setEmail}
            validate={(value) => {
              if (!value) return localization.auth.fieldRequired
              if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
                return localization.auth.invalidEmail
            }}
          >
            <Label>{localization.auth.email}</Label>

            <Input placeholder={localization.auth.email} required />

            <FieldError />
          </TextField>

          <View className="gap-1.5">
            <Label>{organizationLocalization.role}</Label>

            <Button
              variant="secondary"
              isDisabled={isInviting}
              className="w-full flex-row items-center justify-between"
              onPress={() => setRoleMenuOpen(true)}
            >
              <Text className="text-base text-foreground">{roleLabel}</Text>

              <ChevronDown width={16} height={16} color={colors.muted} />
            </Button>

            <Menu
              isOpen={roleMenuOpen}
              onOpenChange={setRoleMenuOpen}
              selectedKey={role}
              onSelect={setRole}
            >
              {Object.entries(roles).map(([key, label]) => (
                <Menu.Item key={key} id={key}>
                  {label}
                </Menu.Item>
              ))}
            </Menu>
          </View>
        </AlertDialog.Body>

        <AlertDialog.Footer>
          <Button
            variant="tertiary"
            isDisabled={isInviting}
            onPress={() => onOpenChange(false)}
          >
            {localization.settings.cancel}
          </Button>

          <Button
            type="submit"
            isPending={isInviting}
            isDisabled={!isRoleValid}
          >
            {organizationLocalization.inviteMember}
          </Button>
        </AlertDialog.Footer>
      </Form>
    </AlertDialog>
  )
}
