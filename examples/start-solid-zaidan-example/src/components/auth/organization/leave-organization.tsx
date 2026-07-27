import type { OrganizationLocalization } from "@better-auth-ui/core/plugins"
import type {
  LeaveOrganizationParams,
  OrganizationAuthClient
} from "@better-auth-ui/solid"
import {
  useActiveOrganization,
  useAuth,
  useLeaveOrganization
} from "@better-auth-ui/solid"
import { createSignal, Show } from "solid-js"
import { toast } from "solid-sonner"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { organizationPlugin } from "@/lib/auth/organization-plugin"

export type LeaveOrganizationProps = {
  localization: Pick<
    OrganizationLocalization,
    "leaveOrganization" | "leaveOrganizationDescription" | "leftOrganization"
  >
}

function LeaveOrganizationDialog(props: {
  localization: LeaveOrganizationProps["localization"]
  onOpenChange: (open: boolean) => void
  open: boolean
}) {
  const auth = useAuth()
  const activeOrganization = useActiveOrganization(
    auth.authClient as OrganizationAuthClient
  )
  const organizationSettingsPath =
    organizationPlugin().viewPaths.settings?.organizations ?? "organizations"
  const leaveOrganization = useLeaveOrganization(
    auth.authClient as OrganizationAuthClient,
    {
      onSuccess: () => {
        props.onOpenChange(false)
        toast.success(props.localization.leftOrganization)
        auth.navigate({
          replace: true,
          to: `${auth.basePaths.settings}/${organizationSettingsPath}`
        })
      }
    }
  )

  const handleLeave = () => {
    if (!activeOrganization.data) return

    leaveOrganization.mutate({
      organizationId: activeOrganization.data.id
    } satisfies LeaveOrganizationParams)
  }

  return (
    <AlertDialog open={props.open} onOpenChange={props.onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {props.localization.leaveOrganization}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {props.localization.leaveOrganizationDescription}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={leaveOrganization.isPending}
            type="button"
          >
            {auth.localization.settings.cancel}
          </AlertDialogCancel>
          <Button
            disabled={leaveOrganization.isPending || !activeOrganization.data}
            onClick={handleLeave}
            type="button"
            variant="destructive"
          >
            {props.localization.leaveOrganization}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export function LeaveOrganization(props: LeaveOrganizationProps) {
  const auth = useAuth()
  const [confirmOpen, setConfirmOpen] = createSignal(false)
  const activeOrganization = useActiveOrganization(
    auth.authClient as OrganizationAuthClient
  )

  return (
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p class="font-medium text-sm leading-tight">
          {props.localization.leaveOrganization}
        </p>
        <p class="mt-0.5 text-muted-foreground text-xs">
          {props.localization.leaveOrganizationDescription}
        </p>
      </div>

      <Button
        class="text-destructive"
        disabled={!activeOrganization.data}
        onClick={() => setConfirmOpen(true)}
        size="sm"
        type="button"
        variant="outline"
      >
        {props.localization.leaveOrganization}
      </Button>

      <Show when={activeOrganization.data}>
        <LeaveOrganizationDialog
          localization={props.localization}
          onOpenChange={setConfirmOpen}
          open={confirmOpen()}
        />
      </Show>
    </div>
  )
}
