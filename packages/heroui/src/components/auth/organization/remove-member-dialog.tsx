import type { OrganizationAuthClient } from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useRemoveMember } from "@better-auth-ui/react/plugins/organization"
import { TrashBin } from "@gravity-ui/icons"
import { AlertDialog, Button, Card, Chip, Spinner, toast } from "@heroui/react"
import type { Member, User } from "better-auth/client"

import { organizationPlugin } from "../../../lib/auth/organization-plugin"
import { UserView } from "../user/user-view"

export type RemoveMemberDialogProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  member: Member & { user: Partial<User> }
}

export function RemoveMemberDialog({
  isOpen,
  onOpenChange,
  member
}: RemoveMemberDialogProps) {
  const { authClient, localization } = useAuth()
  const { localization: organizationLocalization, roles } =
    useAuthPlugin(organizationPlugin)

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
    <AlertDialog.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <AlertDialog.Container>
        <AlertDialog.Dialog>
          <AlertDialog.CloseTrigger />

          <AlertDialog.Header>
            <AlertDialog.Icon status="danger">
              <TrashBin />
            </AlertDialog.Icon>

            <AlertDialog.Heading>
              {organizationLocalization.removeMember}
            </AlertDialog.Heading>
          </AlertDialog.Header>

          <AlertDialog.Body className="flex flex-col gap-4 overflow-visible">
            <p className="text-muted text-sm">
              {organizationLocalization.removeMemberWarning}
            </p>

            <Card variant="secondary">
              <Card.Content className="justify-between flex-row items-center gap-2">
                <UserView user={member.user} />

                <Chip size="sm" variant="tertiary">
                  <Chip.Label>{roles?.[member.role] ?? member.role}</Chip.Label>
                </Chip>
              </Card.Content>
            </Card>
          </AlertDialog.Body>

          <AlertDialog.Footer>
            <Button slot="close" variant="tertiary" isDisabled={isPending}>
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
              {isPending && <Spinner color="current" size="sm" />}

              {organizationLocalization.removeMember}
            </Button>
          </AlertDialog.Footer>
        </AlertDialog.Dialog>
      </AlertDialog.Container>
    </AlertDialog.Backdrop>
  )
}
