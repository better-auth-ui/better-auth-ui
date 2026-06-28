import type { OrganizationAuthClient } from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useLeaveOrganization } from "@better-auth-ui/react/plugins/organization"
import { ArrowRightFromSquare } from "@gravity-ui/icons"
import { AlertDialog, Button, Card, Spinner, toast } from "@heroui/react"
import type { Organization } from "better-auth/client"

import { organizationPlugin } from "../../../lib/auth/organization-plugin"
import { OrganizationView } from "./organization-view"

export type LeaveOrganizationDialogProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  organization: Organization
}

export function LeaveOrganizationDialog({
  isOpen,
  onOpenChange,
  organization
}: LeaveOrganizationDialogProps) {
  const { authClient, basePaths, localization, navigate } = useAuth()
  const {
    localization: organizationLocalization,
    viewPaths: organizationPluginViewPaths
  } = useAuthPlugin(organizationPlugin)

  const { mutate: leaveOrganization, isPending } = useLeaveOrganization(
    authClient as OrganizationAuthClient,
    {
      onSuccess: () => {
        onOpenChange(false)
        toast.success(organizationLocalization.leftOrganization)

        navigate({
          to: `${basePaths.settings}/${organizationPluginViewPaths.settings.organizations}`,
          replace: true
        })
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
              <ArrowRightFromSquare />
            </AlertDialog.Icon>

            <AlertDialog.Heading>
              {organizationLocalization.leaveOrganization}
            </AlertDialog.Heading>
          </AlertDialog.Header>

          <AlertDialog.Body className="flex flex-col gap-4 overflow-visible">
            <p className="text-muted text-sm">
              {organizationLocalization.leaveOrganizationDescription}
            </p>

            <Card variant="secondary">
              <Card.Content>
                <OrganizationView organization={organization} hideRole />
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
                leaveOrganization({ organizationId: organization.id })
              }
            >
              {isPending && <Spinner color="current" size="sm" />}

              {organizationLocalization.leaveOrganization}
            </Button>
          </AlertDialog.Footer>
        </AlertDialog.Dialog>
      </AlertDialog.Container>
    </AlertDialog.Backdrop>
  )
}
