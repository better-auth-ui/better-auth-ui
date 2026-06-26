import type { OrganizationAuthClient } from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useDeleteOrganization } from "@better-auth-ui/react/plugins/organization"
import { TriangleExclamation } from "@gravity-ui/icons"
import { AlertDialog, Button, Card, Form, Spinner, toast } from "@heroui/react"
import type { Organization } from "better-auth/client"
import type { SyntheticEvent } from "react"

import { organizationPlugin } from "../../../lib/auth/organization-plugin"
import { OrganizationView } from "./organization-view"

export type DeleteOrganizationDialogProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  organization: Organization
}

export function DeleteOrganizationDialog({
  isOpen,
  onOpenChange,
  organization
}: DeleteOrganizationDialogProps) {
  const { authClient, basePaths, localization, navigate } = useAuth()
  const {
    localization: organizationLocalization,
    viewPaths: organizationPluginViewPaths
  } = useAuthPlugin(organizationPlugin)

  const { mutate: deleteOrganization, isPending } = useDeleteOrganization(
    authClient as OrganizationAuthClient,
    {
      onSuccess: () => {
        onOpenChange(false)
        toast.success(organizationLocalization.organizationDeleted)

        navigate({
          to: `${basePaths.settings}/${organizationPluginViewPaths.settings.organizations}`,
          replace: true
        })
      }
    }
  )

  function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    deleteOrganization({ organizationId: organization.id })
  }

  return (
    <AlertDialog.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <AlertDialog.Container>
        <AlertDialog.Dialog>
          <Form onSubmit={handleSubmit}>
            <AlertDialog.CloseTrigger />

            <AlertDialog.Header>
              <AlertDialog.Icon status="danger">
                <TriangleExclamation />
              </AlertDialog.Icon>

              <AlertDialog.Heading>
                {organizationLocalization.deleteOrganization}
              </AlertDialog.Heading>
            </AlertDialog.Header>

            <AlertDialog.Body className="flex flex-col gap-4 overflow-visible">
              <p className="text-muted text-sm">
                {organizationLocalization.deleteOrganizationDescription}
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

              <Button type="submit" variant="danger" isPending={isPending}>
                {isPending && <Spinner color="current" size="sm" />}

                {organizationLocalization.deleteOrganization}
              </Button>
            </AlertDialog.Footer>
          </Form>
        </AlertDialog.Dialog>
      </AlertDialog.Container>
    </AlertDialog.Backdrop>
  )
}
