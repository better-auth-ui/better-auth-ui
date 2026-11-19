import {
  hasMemberRole,
  organizationPlugin
} from "@better-auth-ui/core/plugins/organization"
import { useSession, useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useAllOrganizationMembers } from "./use-all-members"
import type { OrganizationAuthClient } from "@better-auth-ui/core/plugins/organization"
import {
  useActiveOrganization,
  useHasPermission,
  useLeaveOrganization
} from "@better-auth-ui/react/plugins/organization"
import type { Organization } from "better-auth/client"
import { useState } from "react"

import type { SettingsViewProps } from "../../../lib/auth-plugin"
import { cn } from "../../../lib/cn"
import { useThemeColors } from "../../../lib/theme-colors"
import { AlertDialog } from "../../../primitives/alert-dialog"
import { Button } from "../../../primitives/button"
import { Card } from "../../../primitives/card"
import { Box, Txt } from "../../../primitives/styled"
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
  const { authClient, localization } = useAuth<OrganizationAuthClient>()

  const { data: deletePermission, isPending: deletePermissionPending } =
    useHasPermission(authClient, {
      permissions: { organization: ["delete"] }
    })

  const canDelete = !!deletePermission?.success

  return (
    <Box className={cn("flex-col", className)}>
      <Txt className="mb-3 text-sm font-semibold text-danger">
        {localization.settings.dangerZone}
      </Txt>

      <Card variant={variant}>
        <Card.Content className="gap-0">
          <LeaveOrganization />
          {deletePermissionPending ? (
            <DeleteOrganizationSkeleton />
          ) : canDelete ? (
            <>
              <Box className="-mx-4 my-4 border-b border-dashed border-border" />
              <DeleteOrganization />
            </>
          ) : null}
        </Card.Content>
      </Card>
    </Box>
  )
}

/**
 * Danger-zone row to leave the active organization. Not yet ported as its own
 * file in the RN package, so it's inlined here (mirroring how
 * {@link DeleteOrganization}'s own confirm dialog is inlined in its file)
 * following the exact same pattern.
 */
function LeaveOrganization() {
  const { authClient } = useAuth<OrganizationAuthClient>()
  const { localization: organizationLocalization } =
    useAuthPlugin(organizationPlugin)

  const { data: activeOrganization } = useActiveOrganization(authClient)

  const { creatorRole } = useAuthPlugin(organizationPlugin)
  const session = useSession(authClient)
  const members = useAllOrganizationMembers(activeOrganization?.id)
  const current = members.data?.members.find(
    (member) => member.userId === session.data?.user.id
  )
  const blocked =
    members.isPending ||
    members.isError ||
    (!!current &&
      hasMemberRole(current.role, creatorRole) &&
      members.data.members.filter((member) =>
        hasMemberRole(member.role, creatorRole)
      ).length <= 1)
  const [confirmOpen, setConfirmOpen] = useState(false)

  return (
    <Box className="flex-col gap-4">
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
        isDisabled={!activeOrganization || blocked}
        onPress={() => setConfirmOpen(true)}
      >
        {organizationLocalization.leaveOrganization}
      </Button>

      {blocked && !members.isPending ? (
        <Txt className="text-sm text-muted">
          {organizationLocalization.onlyOwnerActionDisabled}
        </Txt>
      ) : null}
      {activeOrganization && !blocked && (
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
 * button driving `useLeaveOrganization`. On success, navigates back to the
 * organizations list settings view.
 */
function LeaveOrganizationDialog({
  isOpen,
  onOpenChange,
  organization
}: LeaveOrganizationDialogProps) {
  const { authClient, basePaths, localization, navigate } =
    useAuth<OrganizationAuthClient>()
  const {
    localization: organizationLocalization,
    viewPaths: organizationViewPaths
  } = useAuthPlugin(organizationPlugin)
  const colors = useThemeColors()

  const { mutate: leaveOrganization, isPending } = useLeaveOrganization(
    authClient,
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
