"use client"

import {
  type useListDeviceSessions,
  useSetActiveSession
} from "@better-auth-ui/react"

import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Spinner } from "@/components/ui/spinner"
import { UserView } from "./user-view"

export type DeviceSession = NonNullable<
  ReturnType<typeof useListDeviceSessions>["data"]
>[number]

export type SwitchAccountItemProps = {
  deviceSession: DeviceSession
}

/**
 * Render a dropdown menu item for switching to a different authenticated session.
 *
 * @param deviceSession - The device session to display and switch to when selected
 * @returns The switch account dropdown menu item as a JSX element
 */
export function SwitchAccountItem({ deviceSession }: SwitchAccountItemProps) {
  const { mutate: setActiveSession, isPending } = useSetActiveSession()

  return (
    <DropdownMenuItem
      disabled={isPending}
      onSelect={() =>
        setActiveSession({ sessionToken: deviceSession.session.token })
      }
    >
      <UserView user={deviceSession.user} />

      {isPending && <Spinner className="ml-auto size-4" />}
    </DropdownMenuItem>
  )
}
