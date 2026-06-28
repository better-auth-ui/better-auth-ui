import type {
  DeleteOrganizationParams,
  OrganizationAuthClient,
  OrganizationLocalization
} from "@better-auth-ui/core/plugins/organization"
import { useAuth } from "@better-auth-ui/solid"
import { useDeleteOrganization } from "@better-auth-ui/solid/plugins/organization"
import type { Organization } from "better-auth/client"
import { TriangleAlert } from "lucide-solid"
import { toast } from "solid-sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
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
  const auth = useAuth<OrganizationAuthClient>()
  const organizationSettingsPath =
    organizationPlugin().viewPaths.settings?.organizations ?? "organizations"
  const deleteOrganization = useDeleteOrganization(auth.authClient, () => ({
    onSuccess: () => {
      props.onOpenChange(false)
      toast.success(props.localization.organizationDeleted)
      auth.navigate({
        replace: true,
        to: `${auth.basePaths.settings}/${organizationSettingsPath}`
      })
    }
  }))

  const handleSubmit = (event: SubmitEvent) => {
    event.preventDefault()

    deleteOrganization.mutate({
      organizationId: props.organization.id
    } satisfies DeleteOrganizationParams)
  }

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent>
        <form class="flex flex-col gap-6" onSubmit={handleSubmit}>
          <DialogHeader>
            <div class="flex size-10 items-center justify-center rounded-md bg-destructive/10 text-destructive">
              <TriangleAlert class="size-4.5" />
            </div>
            <DialogTitle>{props.localization.deleteOrganization}</DialogTitle>
            <DialogDescription>
              {props.localization.deleteOrganizationDescription}
            </DialogDescription>
          </DialogHeader>

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

          <DialogFooter>
            <DialogClose
              as={Button}
              disabled={deleteOrganization.isPending}
              type="button"
              variant="outline"
            >
              {auth.localization.settings.cancel}
            </DialogClose>
            <Button
              disabled={deleteOrganization.isPending}
              type="submit"
              variant="destructive"
            >
              {props.localization.deleteOrganization}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
