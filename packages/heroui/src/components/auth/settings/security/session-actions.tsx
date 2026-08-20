import {
  useAuth,
  useRevokeOtherSessions,
  useRevokeSessions
} from "@better-auth-ui/react"
import { AlertDialog, Button, Spinner, toast } from "@heroui/react"
import { useState } from "react"

export type SessionActionsProps = {
  hasOtherSessions: boolean
}

type PendingAction = "other" | "all"

/** Bulk session controls with confirmation for security-sensitive revocation. */
export function SessionActions({ hasOtherSessions }: SessionActionsProps) {
  const { authClient, basePaths, localization, navigate, viewPaths } = useAuth()
  const [action, setAction] = useState<PendingAction | null>(null)

  const revokeOtherSessions = useRevokeOtherSessions(authClient, {
    onSuccess: () => {
      toast.success(localization.settings.signOutOtherDevicesSuccess)
      setAction(null)
    }
  })
  const revokeSessions = useRevokeSessions(authClient, {
    onSuccess: () =>
      navigate({
        to: `${basePaths.auth}/${viewPaths.auth.signIn}`,
        replace: true
      })
  })

  const isPending = revokeOtherSessions.isPending || revokeSessions.isPending
  const isEverywhere = action === "all"

  return (
    <>
      <div className="flex flex-wrap justify-end gap-2 border-t border-divider px-4 py-3">
        <Button
          variant="outline"
          size="sm"
          isDisabled={!hasOtherSessions || isPending}
          onPress={() => setAction("other")}
        >
          {localization.settings.signOutOtherDevices}
        </Button>

        <Button
          variant="danger"
          size="sm"
          isDisabled={isPending}
          onPress={() => setAction("all")}
        >
          {localization.settings.signOutEverywhere}
        </Button>
      </div>

      <AlertDialog.Backdrop
        isOpen={action !== null}
        onOpenChange={(isOpen) => !isOpen && !isPending && setAction(null)}
      >
        <AlertDialog.Container>
          <AlertDialog.Dialog>
            <AlertDialog.CloseTrigger />
            <AlertDialog.Header>
              <AlertDialog.Heading>
                {isEverywhere
                  ? localization.settings.signOutEverywhere
                  : localization.settings.signOutOtherDevices}
              </AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body>
              {isEverywhere
                ? localization.settings.signOutEverywhereDescription
                : localization.settings.signOutOtherDevicesDescription}
            </AlertDialog.Body>
            <AlertDialog.Footer>
              <Button
                variant="tertiary"
                isDisabled={isPending}
                onPress={() => setAction(null)}
              >
                {localization.settings.cancel}
              </Button>
              <Button
                variant={isEverywhere ? "danger" : "primary"}
                isDisabled={isPending}
                onPress={() =>
                  isEverywhere
                    ? revokeSessions.mutate()
                    : revokeOtherSessions.mutate()
                }
              >
                {isPending && <Spinner color="current" size="sm" />}
                {isEverywhere
                  ? localization.settings.signOutEverywhere
                  : localization.settings.signOutOtherDevices}
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </>
  )
}
