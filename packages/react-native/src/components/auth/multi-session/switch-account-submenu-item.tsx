import {
  type MultiSessionAuthClient,
  useAuth,
  useSetActiveSession
} from "@better-auth-ui/react"
import type { Session, User } from "better-auth"
import { View } from "react-native"
import { Menu } from "../../../primitives/menu"
import { Spinner } from "../../../primitives/spinner"
import { UserView } from "../user/user-view"

type DeviceSession = {
  session: Session
  user: User
}

export type SwitchAccountSubmenuItemProps = {
  deviceSession: DeviceSession
  hideSubtitle?: boolean
}

/**
 * Render a menu item for switching to a different authenticated session.
 *
 * @param deviceSession - The device session to display and switch to when pressed
 * @returns The switch account menu item as a JSX element
 */
export function SwitchAccountSubmenuItem({
  deviceSession,
  hideSubtitle
}: SwitchAccountSubmenuItemProps) {
  const { authClient } = useAuth()
  const { mutate: setActiveSession, isPending } = useSetActiveSession(
    authClient as MultiSessionAuthClient
  )

  return (
    <Menu.Item
      className="px-2"
      isDisabled={isPending}
      onPress={() =>
        setActiveSession({ sessionToken: deviceSession.session.token })
      }
    >
      <View className="flex-1 flex-row items-center">
        <UserView user={deviceSession.user} hideSubtitle={hideSubtitle} />

        {isPending && <Spinner size="sm" color="current" className="ml-auto" />}
      </View>
    </Menu.Item>
  )
}
