import type { OrganizationAuthClient } from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useLeaveOrganization } from "@better-auth-ui/react/plugins/organization"
import type { Organization } from "better-auth/client"

import { organizationPlugin } from "../../../lib/auth/organization-plugin"
import { useThemeColors } from "../../../lib/theme-colors"
import { useAuthNavigation } from "../../../navigation/navigation-context"
import { AlertDialog } from "../../../primitives/alert-dialog"
import { Button } from "../../../primitives/button"
import { Card } from "../../../primitives/card"
import { Txt } from "../../../primitives/styled"
import { toast } from "../../../primitives/toast"
import { ArrowRightFromSquare } from "../../../primitives/ui-icons"
import { OrganizationView } from "./organization-view"

export type LeaveOrganizationDialogProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  organization: Organization
}

/**
 * Confirm/leave-organization dialog: a `Card`-wrapped `OrganizationView`
 * summarizing the organization being left, with a danger-styled confirm
 * button driving `useLeaveOrganization`. Mirrors the heroui
 * `LeaveOrganizationDialog`, adapted for React Native: `AlertDialog.Backdrop`/
 * `.Container`/`.Dialog` collapse into the single controlled RN `AlertDialog`
 * root, the cancel button is a plain `onPress` closing the dialog instead of
 * react-aria's `slot="close"`, and the post-leave redirect goes through
 * `useAuthNavigation().push(...)` instead of a raw path join.
 */
export function LeaveOrganizationDialog({
  isOpen,
  onOpenChange,
  organization
}: LeaveOrganizationDialogProps) {
  const { authClient, localization } = useAuth()
  const { localization: organizationLocalization } =
    useAuthPlugin(organizationPlugin)
  const colors = useThemeColors()
  const navigation = useAuthNavigation()

  const { mutate: leaveOrganization, isPending } = useLeaveOrganization(
    authClient as OrganizationAuthClient,
    {
      onSuccess: () => {
        onOpenChange(false)
        toast.success(organizationLocalization.leftOrganization)

        navigation.push(
          { section: "settings", view: "organizations" },
          { replace: true }
        )
      }
    }
  )

  return (
    <AlertDialog isOpen={isOpen} onOpenChange={onOpenChange}>
      <AlertDialog.CloseTrigger />

      <AlertDialog.Header>
        <AlertDialog.Icon status="danger">
          <ArrowRightFromSquare width={20} height={20} color={colors.danger} />
        </AlertDialog.Icon>

        <AlertDialog.Heading>
          {organizationLocalization.leaveOrganization}
        </AlertDialog.Heading>
      </AlertDialog.Header>

      <AlertDialog.Body>
        <Txt className="text-sm text-muted">
          {organizationLocalization.leaveOrganizationDescription}
        </Txt>

        <Card variant="secondary">
          <Card.Content>
            <OrganizationView organization={organization} hideRole />
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
          onPress={() => leaveOrganization({ organizationId: organization.id })}
        >
          {organizationLocalization.leaveOrganization}
        </Button>
      </AlertDialog.Footer>
    </AlertDialog>
  )
}
