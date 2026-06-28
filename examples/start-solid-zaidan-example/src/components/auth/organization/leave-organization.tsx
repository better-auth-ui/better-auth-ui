import type {
  LeaveOrganizationParams,
  OrganizationAuthClient,
  OrganizationLocalization
} from "@better-auth-ui/core/plugins/organization"
import { useAuth } from "@better-auth-ui/solid"
import {
  useActiveOrganization,
  useLeaveOrganization
} from "@better-auth-ui/solid/plugins/organization"
import { createSignal, Show } from "solid-js"
import { toast } from "solid-sonner"
import { Button } from "@/components/ui/button"
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
  const auth = useAuth<OrganizationAuthClient>()
  const activeOrganization = useActiveOrganization(auth.authClient)
  const organizationSettingsPath =
    organizationPlugin().viewPaths.settings?.organizations ?? "organizations"
  const leaveOrganization = useLeaveOrganization(auth.authClient, () => ({
    onSuccess: () => {
      props.onOpenChange(false)
      toast.success(props.localization.leftOrganization)
      auth.navigate({
        replace: true,
        to: `${auth.basePaths.settings}/${organizationSettingsPath}`
      })
    }
  }))

  const handleLeave = () => {
    if (!activeOrganization.data) return

    leaveOrganization.mutate({
      organizationId: activeOrganization.data.id
    } satisfies LeaveOrganizationParams)
  }

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{props.localization.leaveOrganization}</DialogTitle>
          <DialogDescription>
            {props.localization.leaveOrganizationDescription}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose
            as={Button}
            disabled={leaveOrganization.isPending}
            type="button"
            variant="outline"
          >
            {auth.localization.settings.cancel}
          </DialogClose>
          <Button
            disabled={leaveOrganization.isPending || !activeOrganization.data}
            onClick={handleLeave}
            type="button"
            variant="destructive"
          >
            {props.localization.leaveOrganization}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function LeaveOrganization(props: LeaveOrganizationProps) {
  const auth = useAuth<OrganizationAuthClient>()
  const [confirmOpen, setConfirmOpen] = createSignal(false)
  const activeOrganization = useActiveOrganization(auth.authClient)

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
