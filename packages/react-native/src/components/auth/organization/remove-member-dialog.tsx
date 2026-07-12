import {
  type OrganizationAuthClient,
  useAuth,
  useAuthPlugin,
  useRemoveMember
} from "@better-auth-ui/react"
import type { Member, User } from "better-auth/client"
import { Text } from "react-native"

import { organizationPlugin } from "../../../lib/auth/organization-plugin"
import { useThemeColors } from "../../../lib/theme-colors"
import { AlertDialog } from "../../../primitives/alert-dialog"
import { Button } from "../../../primitives/button"
import { Card } from "../../../primitives/card"
import { Chip } from "../../../primitives/tabs"
import { toast } from "../../../primitives/toast"
import { Trash } from "../../../primitives/ui-icons"
import { UserView } from "../user/user-view"

export type RemoveMemberDialogProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  member: Member & { user: Partial<User> }
}

/**
 * Confirm/remove-member dialog: a `Card`-wrapped `UserView` + role `Chip`
 * summarizing the member being removed, with a danger-styled confirm button
 * driving `useRemoveMember`. Mirrors the heroui `RemoveMemberDialog`, adapted
 * for React Native: `AlertDialog.Backdrop`/`.Container`/`.Dialog` collapse
 * into the single controlled RN `AlertDialog` root, and the cancel button is
 * a plain `onPress` closing the dialog instead of react-aria's `slot="close"`.
 */
export function RemoveMemberDialog({
  isOpen,
  onOpenChange,
  member
}: RemoveMemberDialogProps) {
  const { authClient, localization } = useAuth()
  const { localization: organizationLocalization, roles } =
    useAuthPlugin(organizationPlugin)
  const colors = useThemeColors()

  const { mutate: removeMember, isPending } = useRemoveMember(
    authClient as OrganizationAuthClient,
    {
      onSuccess: () => {
        onOpenChange(false)
        toast.success(organizationLocalization.memberRemoved)
      }
    }
  )

  return (
    <AlertDialog isOpen={isOpen} onOpenChange={onOpenChange}>
      <AlertDialog.CloseTrigger />

      <AlertDialog.Header>
        <AlertDialog.Icon status="danger">
          <Trash width={20} height={20} color={colors.danger} />
        </AlertDialog.Icon>

        <AlertDialog.Heading>
          {organizationLocalization.removeMember}
        </AlertDialog.Heading>
      </AlertDialog.Header>

      <AlertDialog.Body>
        <Text className="text-sm text-muted">
          {organizationLocalization.removeMemberWarning}
        </Text>

        <Card variant="secondary">
          <Card.Content className="flex-row items-center justify-between gap-2">
            <UserView user={member.user} />

            <Chip>
              <Chip.Label>{roles?.[member.role] ?? member.role}</Chip.Label>
            </Chip>
          </Card.Content>
        </Card>
      </AlertDialog.Body>

      <AlertDialog.Footer>
        <Button
          variant="tertiary"
          isDisabled={isPending}
          onPress={() => onOpenChange(false)}
        >
          {localization.settings.cancel}
        </Button>

        <Button
          variant="danger"
          isPending={isPending}
          onPress={() =>
            removeMember({
              memberIdOrEmail: member.id,
              organizationId: member.organizationId
            })
          }
        >
          {organizationLocalization.removeMember}
        </Button>
      </AlertDialog.Footer>
    </AlertDialog>
  )
}
