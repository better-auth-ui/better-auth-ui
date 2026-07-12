import {
  type ListDeviceSession,
  type MultiSessionAuthClient,
  useAuth,
  useAuthPlugin,
  useRevokeMultiSession,
  useSetActiveSession,
  useUser
} from "@better-auth-ui/react"
import { View } from "react-native"
import { multiSessionPlugin } from "../../../lib/auth/multi-session-plugin"
import { Button } from "../../../primitives/button"
import {
  ArrowRightArrowLeft,
  ArrowRightFromSquare
} from "../../../primitives/ui-icons"
import { UserView } from "../user/user-view"

export type ManageAccountProps = {
  deviceSession?: ListDeviceSession | null
  isPending?: boolean
}

/**
 * Render a single account row with user info and switch/sign-out actions.
 *
 * Shows the user's avatar and info. When this row is the active session, a
 * "Sign out" button is shown; otherwise inline "Switch account" and "Sign
 * out" icon buttons are shown (the heroui overflow menu is flattened to two
 * always-visible actions, since there are only ever two).
 *
 * @param deviceSession - The device session object containing session and user data
 * @returns A JSX element containing the account row
 */
export function ManageAccount({
  deviceSession,
  isPending
}: ManageAccountProps) {
  const { authClient, localization } = useAuth()
  const { localization: multiSessionLocalization } =
    useAuthPlugin(multiSessionPlugin)
  const { data: user } = useUser(authClient)

  const { mutate: setActiveSession, isPending: isSwitching } =
    useSetActiveSession(authClient as MultiSessionAuthClient)

  const { mutate: revokeSession, isPending: isRevoking } =
    useRevokeMultiSession(authClient as MultiSessionAuthClient)

  const isActive = deviceSession?.session.userId === user?.id
  const isBusy = isSwitching || isRevoking

  return (
    <View className="flex-row items-center justify-between gap-3">
      <UserView user={deviceSession?.user} isPending={isPending} size="md" />

      {deviceSession && isActive && (
        <Button
          className="shrink-0"
          variant="outline"
          size="sm"
          onPress={() =>
            revokeSession({ sessionToken: deviceSession.session.token })
          }
          isDisabled={isBusy}
          isPending={isRevoking}
        >
          <ArrowRightFromSquare width={16} height={16} />
          {localization.auth.signOut}
        </Button>
      )}

      {deviceSession && !isActive && (
        <View className="shrink-0 flex-row items-center gap-1">
          <Button
            isIconOnly
            variant="ghost"
            size="sm"
            isDisabled={isBusy}
            isPending={isSwitching}
            aria-label={multiSessionLocalization.switchAccount}
            onPress={() =>
              setActiveSession({ sessionToken: deviceSession.session.token })
            }
          >
            <ArrowRightArrowLeft width={16} height={16} />
          </Button>

          <Button
            isIconOnly
            variant="ghost"
            size="sm"
            isDisabled={isBusy}
            isPending={isRevoking}
            aria-label={localization.auth.signOut}
            onPress={() =>
              revokeSession({ sessionToken: deviceSession.session.token })
            }
          >
            <ArrowRightFromSquare width={16} height={16} />
          </Button>
        </View>
      )}
    </View>
  )
}
