import {
  useAuth,
  useRevokeOtherSessions,
  useRevokeSessions
} from "@better-auth-ui/solid"
import { LogOut } from "lucide-solid"
import { createSignal, Show } from "solid-js"
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
import { Spinner } from "@/components/ui/spinner"

type PendingAction = "other" | "all"

export function SessionActions(props: { hasOtherSessions: boolean }) {
  const auth = useAuth()
  const [action, setAction] = createSignal<PendingAction | null>(null)

  const revokeOtherSessions = useRevokeOtherSessions(auth.authClient, () => ({
    onSuccess: () => {
      toast.success(auth.localization.settings.signOutOtherDevicesSuccess)
      setAction(null)
    }
  }))
  const revokeSessions = useRevokeSessions(auth.authClient, () => ({
    onSuccess: () =>
      auth.navigate({
        to: `${auth.basePaths.auth}/${auth.viewPaths.auth.signIn}`,
        replace: true
      })
  }))

  const isPending = () =>
    revokeOtherSessions.isPending || revokeSessions.isPending
  const isEverywhere = () => action() === "all"

  return (
    <>
      <div class="flex flex-wrap justify-end gap-2 border-t p-4">
        <Button
          disabled={!props.hasOtherSessions || isPending()}
          onClick={() => setAction("other")}
          size="sm"
          type="button"
          variant="outline"
        >
          {auth.localization.settings.signOutOtherDevices}
        </Button>
        <Button
          disabled={isPending()}
          onClick={() => setAction("all")}
          size="sm"
          type="button"
          variant="destructive"
        >
          {auth.localization.settings.signOutEverywhere}
        </Button>
      </div>

      <AlertDialog
        open={action() !== null}
        onOpenChange={(open) => !open && !isPending() && setAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia class="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
              <LogOut />
            </AlertDialogMedia>
            <AlertDialogTitle>
              {isEverywhere()
                ? auth.localization.settings.signOutEverywhere
                : auth.localization.settings.signOutOtherDevices}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isEverywhere()
                ? auth.localization.settings.signOutEverywhereDescription
                : auth.localization.settings.signOutOtherDevicesDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending()} type="button">
              {auth.localization.settings.cancel}
            </AlertDialogCancel>
            <Button
              disabled={isPending()}
              onClick={() =>
                isEverywhere()
                  ? revokeSessions.mutate()
                  : revokeOtherSessions.mutate()
              }
              type="button"
              variant={isEverywhere() ? "destructive" : "default"}
            >
              <Show when={isPending()}>
                <Spinner />
              </Show>
              {isEverywhere()
                ? auth.localization.settings.signOutEverywhere
                : auth.localization.settings.signOutOtherDevices}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
