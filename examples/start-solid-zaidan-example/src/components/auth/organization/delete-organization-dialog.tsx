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
import { Card, CardContent } from "@/components/ui/card"
import { organizationPlugin } from "@/lib/auth/organization-plugin"
import { createAuthForm } from "../auth-form"
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

  const form = createAuthForm(() => ({
    defaultValues: {},
    onSubmit: async () => {
      await deleteOrganization.mutateAsync({
        organizationId: props.organization.id
      } satisfies DeleteOrganizationParams)
    }
  }))

  return (
    <AlertDialog open={props.open} onOpenChange={props.onOpenChange}>
      <AlertDialogContent>
        <form.AppForm>
          <form.AuthFormRoot class="flex flex-col gap-6">
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
                  <OrganizationLogo
                    organization={props.organization}
                    size="sm"
                  />
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
              <form.AuthFormSubmitButton
                disabled={deleteOrganization.isPending}
                variant="destructive"
              >
                {props.localization.deleteOrganization}
              </form.AuthFormSubmitButton>
            </AlertDialogFooter>
            <form.AuthFormServerError />
          </form.AuthFormRoot>
        </form.AppForm>
      </AlertDialogContent>
    </AlertDialog>
  )
}
