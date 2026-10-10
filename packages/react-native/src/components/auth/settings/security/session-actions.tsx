import {
  useAuth,
  useRevokeOtherSessions,
  useRevokeSessions
} from "@better-auth-ui/react"
import { AlertDialog } from "../../../../primitives/alert-dialog"
import { Button } from "../../../../primitives/button"
import { Box, Txt } from "../../../../primitives/styled"
import { toast } from "../../../../primitives/toast"
import { useAuthNavigation } from "../../../../navigation/navigation-context"
import { useState } from "react"

export type SessionActionsProps = {
  hasOtherSessions: boolean
}

type PendingAction = "other" | "all"

/** Bulk session controls with confirmation for security-sensitive revocation. */
export function SessionActions({ hasOtherSessions }: SessionActionsProps) {
  const { authClient, localization } = useAuth()
  const navigation = useAuthNavigation()
  const [action, setAction] = useState<PendingAction | null>(null)

  const revokeOtherSessions = useRevokeOtherSessions(authClient, {
    onSuccess: () => {
      toast.success(localization.settings.signOutOtherDevicesSuccess)
      setAction(null)
    }
  })
  const revokeSessions = useRevokeSessions(authClient, {
    onSuccess: () => navigation.push("signIn", { replace: true })
  })

  const isPending = revokeOtherSessions.isPending || revokeSessions.isPending
  const isEverywhere = action === "all"

  return (
    <>
      <Box className="flex flex-wrap justify-end gap-2 border-t border-divider px-4 py-3">
        <Button
          variant="secondary"
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
      </Box>

      <AlertDialog
        isOpen={action !== null}
        onOpenChange={(isOpen) => !isOpen && !isPending && setAction(null)}
      >
        <AlertDialog.Header>
          <AlertDialog.Heading>
            {isEverywhere
              ? localization.settings.signOutEverywhere
              : localization.settings.signOutOtherDevices}
          </AlertDialog.Heading>
        </AlertDialog.Header>
        <AlertDialog.Body>
          <Txt>
            {isEverywhere
              ? localization.settings.signOutEverywhereDescription
              : localization.settings.signOutOtherDevicesDescription}
          </Txt>
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
            isPending={isPending}
            onPress={() =>
              isEverywhere
                ? revokeSessions.mutate()
                : revokeOtherSessions.mutate()
            }
          >
            {isEverywhere
              ? localization.settings.signOutEverywhere
              : localization.settings.signOutOtherDevices}
          </Button>
        </AlertDialog.Footer>
      </AlertDialog>
    </>
  )
}
