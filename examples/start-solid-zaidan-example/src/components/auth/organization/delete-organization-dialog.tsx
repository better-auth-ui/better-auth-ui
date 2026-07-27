import type { OrganizationLocalization } from "@better-auth-ui/core/plugins"
import type {
  DeleteOrganizationParams,
  OrganizationAuthClient
} from "@better-auth-ui/solid"
import { useAuth, useDeleteOrganization } from "@better-auth-ui/solid"
import type { Organization } from "better-auth/client"
import { TriangleAlert } from "lucide-solid"
import { toast } from "solid-sonner"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { organizationPlugin } from "@/lib/auth/organization-plugin"
import { OrganizationLogo } from "./organization-logo"

export type DeleteOrganizationDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  organization: Organization
  localization: Pick<
    OrganizationLocalization,
    | "deleteOrganization"
    | "deleteOrganizationDescription"
    | "organizationDeleted"
  >
}

export function DeleteOrganizationDialog(props: DeleteOrganizationDialogProps) {
  const auth = useAuth()
  const organizationSettingsPath =
    organizationPlugin().viewPaths.settings?.organizations ?? "organizations"
  const deleteOrganization = useDeleteOrganization(
    auth.authClient as OrganizationAuthClient,
    {
      onSuccess: () => {
        props.onOpenChange(false)
        toast.success(props.localization.organizationDeleted)
        auth.navigate({
          replace: true,
          to: `${auth.basePaths.settings}/${organizationSettingsPath}`
        })
      }
    }
  )

  const handleSubmit = (event: SubmitEvent) => {
    event.preventDefault()

    deleteOrganization.mutate({
      organizationId: props.organization.id
    } satisfies DeleteOrganizationParams)
  }

  return (
    <AlertDialog open={props.open} onOpenChange={props.onOpenChange}>
      <AlertDialogContent>
        <form class="flex flex-col gap-6" onSubmit={handleSubmit}>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <TriangleAlert />
            </AlertDialogMedia>
            <AlertDialogTitle>
              {props.localization.deleteOrganization}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {props.localization.deleteOrganizationDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <Card>
            <CardContent>
              <div class="flex items-center gap-3">
                <OrganizationLogo organization={props.organization} size="sm" />
                <div class="grid min-w-0 gap-1">
                  <span class="truncate text-sm font-medium">
                    {props.organization.name}
                  </span>
                  <span class="truncate text-muted-foreground text-xs">
                    {props.organization.slug}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={deleteOrganization.isPending}
              type="button"
            >
              {auth.localization.settings.cancel}
            </AlertDialogCancel>
            <Button
              disabled={deleteOrganization.isPending}
              type="submit"
              variant="destructive"
            >
              {props.localization.deleteOrganization}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
