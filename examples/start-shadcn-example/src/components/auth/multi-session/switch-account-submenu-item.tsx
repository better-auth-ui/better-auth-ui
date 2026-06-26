"use client"

import {
  type ListDeviceSession,
  type MultiSessionAuthClient,
  useAuth,
  useSetActiveSession
} from "@better-auth-ui/react"
import { UserView } from "@/components/auth/user/user-view"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Spinner } from "@/components/ui/spinner"

export type SwitchAccountSubmenuItemProps = {
  deviceSession: ListDeviceSession
}

/**
 * Render a dropdown menu item for switching to a different authenticated session.
 *
 * @param deviceSession - The device session to display and switch to when selected
 * @returns The switch account dropdown menu item as a JSX element
 */
export function SwitchAccountSubmenuItem({
  deviceSession
}: SwitchAccountSubmenuItemProps) {
  const { authClient } = useAuth<MultiSessionAuthClient>()
  const { mutate: setActiveSession, isPending } = useSetActiveSession(
    authClient,
    {
      onSuccess: () => window.scrollTo({ top: 0 })
    }
  )

  return (
    <DropdownMenuItem
      disabled={isPending}
      onClick={() =>
        setActiveSession({ sessionToken: deviceSession.session.token })
      }
    >
      <UserView user={deviceSession.user} />

      {isPending && <Spinner className="ml-auto size-4" />}
    </DropdownMenuItem>
  )
}
