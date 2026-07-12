import {
  type OrganizationAuthClient,
  useActiveOrganization,
  useAuth,
  useAuthPlugin,
  useHasPermission,
  useLeaveOrganization
} from "@better-auth-ui/react"
import type { Organization } from "better-auth/client"
import { useState } from "react"
import { Text, View } from "react-native"

import { organizationPlugin } from "../../../lib/auth/organization-plugin"
import type { SettingsViewProps } from "../../../lib/auth-plugin"
import { cn } from "../../../lib/cn"
import { useThemeColors } from "../../../lib/theme-colors"
import { AlertDialog } from "../../../primitives/alert-dialog"
import { Button } from "../../../primitives/button"
import { Card } from "../../../primitives/card"
import { toast } from "../../../primitives/toast"
import { ArrowRightFromSquare } from "../../../primitives/ui-icons"
import { DeleteOrganization } from "./delete-organization"
import { DeleteOrganizationSkeleton } from "./delete-organization-skeleton"
import { OrganizationView } from "./organization-view"

export type OrganizationDangerZoneProps = SettingsViewProps

/**
 * Danger zone heading with {@link LeaveOrganization} and {@link DeleteOrganization}
 * for the active organization in a single card.
 *
 * Resolves the `organization:delete` permission before rendering anything to
 * avoid flashing {@link LeaveOrganization} (and a stray separator) before the
 * delete row appears or disappears. Inner {@link DeleteOrganization} also
 * self-gates so it stays safe to use standalone. Mirrors the heroui
 * `OrganizationDangerZone`, adapted for React Native: the `div`/`h2` layout
 * becomes `View`/`Text` and the dashed CSS separator becomes a bordered `View`.
 */
export function OrganizationDangerZone({
  className,
  variant
}: OrganizationDangerZoneProps) {
  const { authClient, localization } = useAuth()

  const { data: deletePermission, isPending: deletePermissionPending } =
    useHasPermission(authClient as OrganizationAuthClient, {
      permissions: { organization: ["delete"] }
    })

  const canDelete = !!deletePermission?.success

  return (
    <View className={cn("flex-col", className)}>
      <Text className="mb-3 text-sm font-semibold text-danger">
        {localization.settings.dangerZone}
      </Text>

      <Card variant={variant}>
        <Card.Content className="gap-0">
          {deletePermissionPending ? (
            <DeleteOrganizationSkeleton />
          ) : (
            <>
              <LeaveOrganization />

              {canDelete && (
                <>
                  <View className="-mx-4 my-4 border-b border-dashed border-border" />

                  <DeleteOrganization />
                </>
              )}
            </>
          )}
        </Card.Content>
      </Card>
    </View>
  )
}

/**
 * Danger-zone row to leave the active organization. Not yet ported as its own
 * file in the RN package, so it's inlined here (mirroring how
 * {@link DeleteOrganization}'s own confirm dialog is inlined in its file)
 * following the exact same pattern.
 */
function LeaveOrganization() {
  const { authClient } = useAuth()
  const { localization: organizationLocalization } =
    useAuthPlugin(organizationPlugin)

  const { data: activeOrganization } = useActiveOrganization(
    authClient as OrganizationAuthClient
  )

  const [confirmOpen, setConfirmOpen] = useState(false)

  return (
    <View className="flex-col gap-4">
      <View>
        <Text className="text-sm font-medium leading-tight text-foreground">
          {organizationLocalization.leaveOrganization}
        </Text>

        <Text className="mt-0.5 text-xs text-muted">
          {organizationLocalization.leaveOrganizationDescription}
        </Text>
      </View>

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
    </View>
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
 * button driving `useLeaveOrganization`. On success, navigates back to the
 * organizations list settings view.
 */
function LeaveOrganizationDialog({
  isOpen,
  onOpenChange,
  organization
}: LeaveOrganizationDialogProps) {
  const { authClient, basePaths, localization, navigate } = useAuth()
  const {
    localization: organizationLocalization,
    viewPaths: organizationViewPaths
  } = useAuthPlugin(organizationPlugin)
  const colors = useThemeColors()

  const { mutate: leaveOrganization, isPending } = useLeaveOrganization(
    authClient as OrganizationAuthClient,
    {
      onSuccess: () => {
        onOpenChange(false)
        toast.success(organizationLocalization.leftOrganization)

        navigate({
          to: `${basePaths.settings}/${organizationViewPaths.settings.organizations}`,
          replace: true
        })
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
        <Text className="text-sm text-muted">
          {organizationLocalization.leaveOrganizationDescription}
        </Text>

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
