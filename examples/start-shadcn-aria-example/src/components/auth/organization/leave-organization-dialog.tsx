"use client"
import type { OrganizationAuthClient } from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useLeaveOrganization } from "@better-auth-ui/react/plugins/organization"
import type { Organization } from "better-auth/client"
import { LogOut } from "lucide-react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { organizationPlugin } from "@/lib/auth/organization-plugin"
import { OrganizationView } from "./organization-view"
export type LeaveOrganizationDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  organization: Organization
}
export function LeaveOrganizationDialog({
  open,
  onOpenChange,
  organization
}: LeaveOrganizationDialogProps) {
  const { authClient, basePaths, localization, navigate } =
    useAuth<OrganizationAuthClient>()
  const {
    localization: organizationLocalization,
    viewPaths: organizationPluginViewPaths
  } = useAuthPlugin(organizationPlugin)
  const { mutate: leaveOrganization, isPending } = useLeaveOrganization(
    authClient,
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
    <AlertDialog isOpen={open} onOpenChange={onOpenChange}>
      <AlertDialogHeader>
        <AlertDialogMedia className="bg-destructive/10 text-destructive">
          <LogOut />
        </AlertDialogMedia>

        <AlertDialogTitle>
          {organizationLocalization.leaveOrganization}
        </AlertDialogTitle>

        <AlertDialogDescription>
          {organizationLocalization.leaveOrganizationDescription}
        </AlertDialogDescription>
      </AlertDialogHeader>

      <Card>
        <CardContent>
          <OrganizationView organization={organization} hideRole />
        </CardContent>
      </Card>

      <AlertDialogFooter>
        <AlertDialogCancel isDisabled={isPending}>
          {localization.settings.cancel}
        </AlertDialogCancel>

        <Button
          variant="destructive"
          isDisabled={isPending}
          onPress={() => leaveOrganization({ organizationId: organization.id })}
        >
          {isPending && <Spinner />}

          {organizationLocalization.leaveOrganization}
        </Button>
      </AlertDialogFooter>
    </AlertDialog>
  )
}
