import type { OrganizationAuthClient } from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import {
  useActiveOrganization,
  useDeleteOrganization,
  useHasPermission
} from "@better-auth-ui/react/plugins/organization"
import type { Organization } from "better-auth/client"
import { useState } from "react"

import { organizationPlugin } from "../../../lib/auth/organization-plugin"
import type { SettingsViewProps } from "../../../lib/auth-plugin"
import { cn } from "../../../lib/cn"
import { useThemeColors } from "../../../lib/theme-colors"
import { AlertDialog } from "../../../primitives/alert-dialog"
import { Button } from "../../../primitives/button"
import { Card } from "../../../primitives/card"
import { Skeleton } from "../../../primitives/skeleton"
import { Box, Txt } from "../../../primitives/styled"
import { toast } from "../../../primitives/toast"
import { TriangleExclamation } from "../../../primitives/ui-icons"
import { OrganizationView } from "./organization-view"

export type DeleteOrganizationProps = SettingsViewProps

/**
 * Danger-zone row to delete the active organization. Hidden for members
 * without the `organization:delete` permission. Mirrors the heroui
 * `DeleteOrganization`, adapted for React Native: the `div`/`p` layout
 * becomes `View`/`Text`, the confirm `AlertDialog` is inlined (RN's
 * `AlertDialog` is a single controlled component rather than heroui's
 * `Backdrop`/`Container`/`Dialog` composition), and the success navigation
 * goes through the shared `navigate`/`basePaths` adapter instead of a raw
 * URL join.
 */
export function DeleteOrganization({ className }: DeleteOrganizationProps) {
  const { authClient } = useAuth()
  const { localization: organizationLocalization } =
    useAuthPlugin(organizationPlugin)

  const { data: activeOrganization } = useActiveOrganization(
    authClient as OrganizationAuthClient
  )

  const { data: permission, isPending: permissionPending } = useHasPermission(
    authClient as OrganizationAuthClient,
    {
      permissions: { organization: ["delete"] }
    }
  )

  const [confirmOpen, setConfirmOpen] = useState(false)

  if (permissionPending) {
    return <DeleteOrganizationSkeleton className={className} />
  }

  if (!permission?.success) {
    return null
  }

  return (
    <Box className={cn("flex-col gap-4", className)}>
      <Box>
        <Txt className="text-sm font-medium leading-tight text-foreground">
          {organizationLocalization.deleteOrganization}
        </Txt>

        <Txt className="mt-0.5 text-xs text-muted">
          {organizationLocalization.deleteOrganizationDescription}
        </Txt>
      </Box>

      <Button
        className="self-start"
        size="sm"
        variant="danger"
        isDisabled={!activeOrganization}
        onPress={() => setConfirmOpen(true)}
      >
        {organizationLocalization.deleteOrganization}
      </Button>

      {activeOrganization && (
        <DeleteOrganizationDialog
          isOpen={confirmOpen}
          onOpenChange={setConfirmOpen}
          organization={activeOrganization}
        />
      )}
    </Box>
  )
}

type DeleteOrganizationDialogProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  organization: Organization
}

/**
 * Confirm/delete-organization dialog: a `Card`-wrapped `OrganizationView`
 * summarizing the organization being deleted, with a danger-styled confirm
 * button driving `useDeleteOrganization`. On success, navigates back to the
 * organizations list settings view.
 */
function DeleteOrganizationDialog({
  isOpen,
  onOpenChange,
  organization
}: DeleteOrganizationDialogProps) {
  const { authClient, basePaths, localization, navigate } = useAuth()
  const {
    localization: organizationLocalization,
    viewPaths: organizationViewPaths
  } = useAuthPlugin(organizationPlugin)
  const colors = useThemeColors()

  const { mutate: deleteOrganization, isPending } = useDeleteOrganization(
    authClient as OrganizationAuthClient,
    {
      onSuccess: () => {
        onOpenChange(false)
        toast.success(organizationLocalization.organizationDeleted)

        navigate({
          to: `${basePaths.settings}/${organizationViewPaths.settings.organizations}`,
          replace: true
        })
      }
    }
  )

  function handleSubmit() {
    deleteOrganization({ organizationId: organization.id })
  }

  return (
    <AlertDialog isOpen={isOpen} onOpenChange={onOpenChange}>
      <AlertDialog.CloseTrigger />

      <AlertDialog.Header>
        <AlertDialog.Icon status="danger">
          <TriangleExclamation width={20} height={20} color={colors.danger} />
        </AlertDialog.Icon>

        <AlertDialog.Heading>
          {organizationLocalization.deleteOrganization}
        </AlertDialog.Heading>
      </AlertDialog.Header>

      <AlertDialog.Body>
        <Txt className="text-sm text-muted">
          {organizationLocalization.deleteOrganizationDescription}
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
          {organizationLocalization.deleteOrganization}
        </Button>
      </AlertDialog.Footer>
    </AlertDialog>
  )
}

/** Placeholder matching {@link DeleteOrganization} while the delete permission resolves. */
function DeleteOrganizationSkeleton({ className }: { className?: string }) {
  return (
    <Box className={cn("flex-col gap-4", className)}>
      <Box className="flex-col gap-1">
        <Skeleton className="h-3.5 w-40 rounded-lg" />
        <Skeleton className="h-3 w-64 rounded-lg" />
      </Box>

      <Skeleton className="h-8 w-36 rounded-full" />
    </Box>
  )
}
