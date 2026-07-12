import {
  type OrganizationAuthClient,
  useAuth,
  useAuthPlugin,
  useDeleteOrganization
} from "@better-auth-ui/react"
import type { Organization } from "better-auth/client"
import { Text } from "react-native"

import { organizationPlugin } from "../../../lib/auth/organization-plugin"
import { useThemeColors } from "../../../lib/theme-colors"
import { useAuthNavigation } from "../../../navigation/navigation-context"
import { AlertDialog } from "../../../primitives/alert-dialog"
import { Button } from "../../../primitives/button"
import { Card } from "../../../primitives/card"
import { Form } from "../../../primitives/form"
import { toast } from "../../../primitives/toast"
import { TriangleExclamation } from "../../../primitives/ui-icons"
import { OrganizationView } from "./organization-view"

export type DeleteOrganizationDialogProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  organization: Organization
}

/**
 * Confirm/delete-organization dialog: a `Card`-wrapped `OrganizationView`
 * summarizing the organization being deleted, with a danger-styled confirm
 * button driving `useDeleteOrganization`. Mirrors the heroui
 * `DeleteOrganizationDialog`, adapted for React Native: `AlertDialog.Backdrop`/
 * `.Container`/`.Dialog` collapse into the single controlled RN `AlertDialog`
 * root, the cancel button is a plain `onPress` closing the dialog instead of
 * react-aria's `slot="close"`, and the post-delete redirect goes through
 * `useAuthNavigation().push(...)` instead of a raw path join.
 */
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

  const { mutate: deleteOrganization, isPending } = useDeleteOrganization(
    authClient as OrganizationAuthClient,
    {
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

  function handleSubmit() {
    deleteOrganization({ organizationId: organization.id })
  }

  return (
    <AlertDialog isOpen={isOpen} onOpenChange={onOpenChange}>
      <Form onSubmit={handleSubmit}>
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
          <Text className="text-sm text-muted">
            {organizationLocalization.deleteOrganizationDescription}
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

          <Button type="submit" variant="danger" isPending={isPending}>
            {organizationLocalization.deleteOrganization}
          </Button>
        </AlertDialog.Footer>
      </Form>
    </AlertDialog>
  )
}
