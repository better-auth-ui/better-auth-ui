import type { OrganizationAuthClient } from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useDeleteOrganization } from "@better-auth-ui/react/plugins/organization"
import { TriangleExclamation } from "@gravity-ui/icons"
import { AlertDialog, Button, Card, toast } from "@heroui/react"
import type { Organization } from "better-auth/client"

import { organizationPlugin } from "../../../lib/auth/organization-plugin"
import { useAuthForm } from "../auth-form"
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

  const { mutateAsync: deleteOrganization, isPending } = useDeleteOrganization(
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

  const form = useAuthForm({
    defaultValues: {},
    onSubmit: async () =>
      await deleteOrganization({ organizationId: organization.id })
  })

  return (
    <AlertDialog.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <AlertDialog.Container>
        <AlertDialog.Dialog>
          <form.AppForm>
            <form.AuthFormRoot>
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
                <form.AuthFormServerError />
              </AlertDialog.Body>

              <AlertDialog.Footer>
                <Button slot="close" variant="tertiary" isDisabled={isPending}>
                  {localization.settings.cancel}
                </Button>

                <form.AuthFormSubmitButton
                  isPending={isPending}
                  variant="danger"
                  isDisabled={isPending}
                >
                  {organizationLocalization.deleteOrganization}
                </form.AuthFormSubmitButton>
              </AlertDialog.Footer>
            </form.AuthFormRoot>
          </form.AppForm>
        </AlertDialog.Dialog>
      </AlertDialog.Container>
    </AlertDialog.Backdrop>
  )
}
