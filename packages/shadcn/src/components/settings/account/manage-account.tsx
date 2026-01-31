"use client"

import {
  useAuth,
  type useListDeviceSessions,
  useRevokeMultiSession,
  useSession,
  useSetActiveSession
} from "@better-auth-ui/react"
import { ArrowLeftRight, LogOut } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Item } from "@/components/ui/item"
import { Spinner } from "@/components/ui/spinner"
import { UserView } from "@/components/user/user-view"

export type DeviceSession = NonNullable<
  ReturnType<typeof useListDeviceSessions>["data"]
>[number]

export type ManageAccountProps = {
  deviceSession?: DeviceSession
  isPending?: boolean
}

/**
 * Render a single account card with user info and switch/revoke controls.
 *
 * Shows the user's avatar and info. For non-active sessions, provides a switch button.
 * All sessions have a revoke/sign-out button.
 *
 * @param deviceSession - The device session object containing session and user data
 * @param isPending - Whether the device session is pending
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
      onError: (error) => toast.error(error.error?.message || error.message)
    })

  const { mutate: revokeSession, isPending: isRevoking } =
    useRevokeMultiSession({
      onError: (error) => toast.error(error.error?.message || error.message),
      onSuccess: () => toast.success(localization.settings.revokeSessionSuccess)
    })

  const isActive = deviceSession?.session.userId === sessionData?.session.userId

  return (
    <Item className="p-3 gap-3" variant="outline">
      <UserView user={deviceSession?.user} isPending={isPending} />

      {deviceSession && (
        <div className="flex items-center gap-1 shrink-0 ml-auto">
          {!isActive && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() =>
                setActiveSession({ sessionToken: deviceSession.session.token })
              }
              disabled={isSwitching || isRevoking}
              aria-label={localization.auth.switchAccount}
            >
              {isSwitching ? <Spinner /> : <ArrowLeftRight />}
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() =>
              revokeSession({ sessionToken: deviceSession.session.token })
            }
            disabled={isSwitching || isRevoking}
            aria-label={localization.auth.signOut}
          >
            {isRevoking ? <Spinner /> : <LogOut />}
          </Button>
        </div>
      )}
    </Item>
  )
}
