import type { OrganizationAuthClient } from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import {
  useActiveOrganization,
  useLeaveOrganization
} from "@better-auth-ui/react/plugins/organization"
import type { Organization } from "better-auth/client"
import { useState } from "react"

import { organizationPlugin } from "../../../lib/auth/organization-plugin"
import type { SettingsViewProps } from "../../../lib/auth-plugin"
import { cn } from "../../../lib/cn"
import { useThemeColors } from "../../../lib/theme-colors"
import { useAuthNavigation } from "../../../navigation/navigation-context"
import { AlertDialog } from "../../../primitives/alert-dialog"
import { Button } from "../../../primitives/button"
import { Card } from "../../../primitives/card"
import { Box, Txt } from "../../../primitives/styled"
import { toast } from "../../../primitives/toast"
import { ArrowRightFromSquare } from "../../../primitives/ui-icons"
import { OrganizationView } from "./organization-view"

export type LeaveOrganizationProps = SettingsViewProps

/**
 * Danger-zone row to leave the active organization. Mirrors the heroui
 * `LeaveOrganization`, adapted for React Native: the `div`/`p` layout becomes
 * `View`/`Text` and the confirm `AlertDialog` is inlined (RN's `AlertDialog`
 * is a single controlled component rather than heroui's
 * `Backdrop`/`Container`/`Dialog` composition).
 */
export function LeaveOrganization({ className }: LeaveOrganizationProps) {
  const { authClient } = useAuth()
  const { localization: organizationLocalization } =
    useAuthPlugin(organizationPlugin)

  const { data: activeOrganization } = useActiveOrganization(
    authClient as OrganizationAuthClient
  )

  const [confirmOpen, setConfirmOpen] = useState(false)

  return (
    <Box className={cn("flex-col gap-4", className)}>
      <Box>
        <Txt className="text-sm font-medium leading-tight text-foreground">
          {organizationLocalization.leaveOrganization}
        </Txt>

        <Txt className="mt-0.5 text-xs text-muted">
          {organizationLocalization.leaveOrganizationDescription}
        </Txt>
      </Box>

      <Button
        className="self-start"
        size="sm"
        variant="danger"
        isDisabled={!activeOrganization}
        onPress={() => setConfirmOpen(true)}
      >
        {organizationLocalization.leaveOrganization}
      </Button>

      {activeOrganization && (
        <LeaveOrganizationDialog
          isOpen={confirmOpen}
          onOpenChange={setConfirmOpen}
          organization={activeOrganization}
        />
      )}
    </Box>
  )
}

type LeaveOrganizationDialogProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  organization: Organization
}

/**
 * Confirm/leave-organization dialog: a `Card`-wrapped `OrganizationView`
 * summarizing the organization being left, with a danger-styled confirm
 * button driving `useLeaveOrganization`. Mirrors the heroui
 * `LeaveOrganizationDialog`, adapted for React Native: the cancel button is a
 * plain `onPress` closing the dialog instead of react-aria's `slot="close"`,
 * and the post-leave redirect goes through `useAuthNavigation().push(...)`
 * instead of a raw path join.
 */
function LeaveOrganizationDialog({
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

  function handleSubmit() {
    leaveOrganization({ organizationId: organization.id })
  }

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

        <Button variant="danger" isPending={isPending} onPress={handleSubmit}>
          {organizationLocalization.leaveOrganization}
        </Button>
      </AlertDialog.Footer>
    </AlertDialog>
  )
}
