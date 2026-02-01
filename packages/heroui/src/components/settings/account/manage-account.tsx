import {
  useAuth,
  useRevokeMultiSession,
  useSession,
  useSetActiveSession
} from "@better-auth-ui/react"
import { ArrowRightArrowLeft, ArrowRightFromSquare } from "@gravity-ui/icons"
import { Button, Card, Spinner, toast } from "@heroui/react"
import type { Session, User } from "better-auth"

import { UserView } from "../../user/user-view"

export type DeviceSession = {
  session: Session
  user: User
}

export type ManageAccountProps = {
  deviceSession?: DeviceSession | null
  isPending?: boolean
}

/**
 * Render a single account card with user info and switch/revoke controls.
 *
 * Shows the user's avatar and info. For non-active sessions, provides a switch button.
 * All sessions have a revoke/sign-out button.
 *
 * @param deviceSession - The device session object containing session and user data
 * @returns A JSX element containing the account card
 */
export function ManageAccount({
  deviceSession,
  isPending
}: ManageAccountProps) {
  const { localization } = useAuth()
  const { data: sessionData } = useSession()

  const { mutate: setActiveSession, isPending: isSwitching } =
    useSetActiveSession({
      onError: (error) =>
        toast.danger(error.error?.message || error.message, { timeout: 3000 })
    })

  const { mutate: revokeSession, isPending: isRevoking } =
    useRevokeMultiSession({
      onError: (error) =>
        toast.danger(error.error?.message || error.message, { timeout: 3000 }),
      onSuccess: () =>
        toast.success(localization.settings.revokeSessionSuccess, {
          timeout: 3000
        })
    })

  const isActive = deviceSession?.session.userId === sessionData?.session.userId

  return (
    <Card className="flex-row items-center border p-3 shadow-none">
      <UserView user={deviceSession?.user} isPending={isPending} size="md" />

      {deviceSession && (
        <div className="flex items-center gap-1 shrink-0 ml-auto">
          {!isActive && (
            <Button
              isIconOnly
              variant="ghost"
              size="sm"
              onPress={() =>
                setActiveSession({ sessionToken: deviceSession.session.token })
              }
              isPending={isSwitching || isRevoking}
              aria-label={localization.auth.switchAccount}
            >
              {isSwitching ? (
                <Spinner color="current" size="sm" />
              ) : (
                <ArrowRightArrowLeft />
              )}
            </Button>
          )}

          <Button
            isIconOnly
            variant="ghost"
            size="sm"
            onPress={() =>
              revokeSession({ sessionToken: deviceSession.session.token })
            }
            isPending={isSwitching || isRevoking}
            aria-label={localization.auth.signOut}
          >
            {isRevoking ? (
              <Spinner color="current" size="sm" />
            ) : (
              <ArrowRightFromSquare />
            )}
          </Button>
        </div>
      )}
    </Card>
  )
}
