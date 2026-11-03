import type { OrganizationAuthClient } from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useDeleteOrganization } from "@better-auth-ui/react/plugins/organization"
import type { Organization } from "better-auth/client"

import { organizationPlugin } from "../../../lib/auth/organization-plugin"
import { useThemeColors } from "../../../lib/theme-colors"
import { useAuthNavigation } from "../../../navigation/navigation-context"
import { AlertDialog } from "../../../primitives/alert-dialog"
import { Button } from "../../../primitives/button"
import { Card } from "../../../primitives/card"
import { useAuthForm } from "../auth-form"
import { Txt } from "../../../primitives/styled"
import { toast } from "../../../primitives/toast"
import { TriangleExclamation } from "../../../primitives/ui-icons"
import { OrganizationView } from "./organization-view"

export type DeleteOrganizationDialogProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  organization: Organization
}

/** Confirm organization deletion and return to the organization list. */
export function DeleteOrganizationDialog({
  isOpen,
  onOpenChange,
  organization
}: DeleteOrganizationDialogProps) {
  const { authClient, localization } = useAuth()
  const { localization: organizationLocalization } =
    useAuthPlugin(organizationPlugin)
  const colors = useThemeColors()
  const navigation = useAuthNavigation()

  const { mutateAsync: deleteOrganization, isPending } = useDeleteOrganization(
    authClient as OrganizationAuthClient,
    {
      meta: { errorPresentation: "inline" },
      onSuccess: () => {
        onOpenChange(false)
        toast.success(organizationLocalization.organizationDeleted)

        navigation.push(
          { section: "settings", view: "organizations" },
          { replace: true }
        )
      }
    }
  )

  const form = useAuthForm({
    defaultValues: {},
    onSubmit: async () => {
      await deleteOrganization({ organizationId: organization.id })
    }
  })

  return (
    <AlertDialog isOpen={isOpen} onOpenChange={onOpenChange}>
      <form.AppForm>
        <form.AuthFormRoot serverErrorMessage={localization.errors.generic}>
          <AlertDialog.CloseTrigger />

          <AlertDialog.Header>
            <AlertDialog.Icon status="danger">
              <TriangleExclamation
                width={20}
                height={20}
                color={colors.danger}
              />
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

            <form.AuthFormSubmitButton variant="danger" isPending={isPending}>
              {organizationLocalization.deleteOrganization}
            </form.AuthFormSubmitButton>
          </AlertDialog.Footer>
        </form.AuthFormRoot>
      </form.AppForm>
    </AlertDialog>
  )
}
