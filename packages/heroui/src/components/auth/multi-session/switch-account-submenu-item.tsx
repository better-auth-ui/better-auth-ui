import type { MultiSessionAuthClient } from "@better-auth-ui/core/plugins/multi-session"
import { useAuth } from "@better-auth-ui/react"
import { useSetActiveSession } from "@better-auth-ui/react/plugins/multi-session"
import { Dropdown, Spinner } from "@heroui/react"
import type { Session, User } from "better-auth"
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
 * Render a dropdown item for switching to a different authenticated session.
 *
 * @param deviceSession - The device session to display and switch to when pressed
 * @returns The switch account dropdown item as a JSX element
 */
export function SwitchAccountSubmenuItem({
  deviceSession,
  hideSubtitle
}: SwitchAccountSubmenuItemProps) {
  const { authClient } = useAuth()
  const { mutate: setActiveSession, isPending } = useSetActiveSession(
    authClient as MultiSessionAuthClient,
    {
      onSuccess: () => window.scrollTo({ top: 0 })
    }
  )

  return (
    <Dropdown.Item
      className="px-2"
      isDisabled={isPending}
      onPress={() =>
        setActiveSession({ sessionToken: deviceSession.session.token })
      }
    >
      <UserView user={deviceSession.user} hideSubtitle={hideSubtitle} />

      {isPending && <Spinner color="current" size="sm" className="ml-auto" />}
    </Dropdown.Item>
  )
}
