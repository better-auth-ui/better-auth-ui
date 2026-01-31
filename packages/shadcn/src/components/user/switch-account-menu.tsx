"use client"

import {
  useAuth,
  useListDeviceSessions,
  useSession
} from "@better-auth-ui/react"
import { Check, CirclePlus } from "lucide-react"

import {
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSubContent
} from "@/components/ui/dropdown-menu"
import { SwitchAccountItem } from "./switch-account-item"
import { UserView } from "./user-view"

/**
 * Render the submenu content for switching between multiple authenticated sessions.
 *
 * Shows the current session with a checkmark, lists other device sessions that can be activated,
 * and provides an option to add a new account. This component should be rendered inside a
 * DropdownMenuSub to defer the useListDeviceSessions query until the submenu is opened.
 *
 * @returns The switch account submenu content as a JSX element
 */
export function SwitchAccountMenu() {
  const { basePaths, viewPaths, localization, Link } = useAuth()
  const { data: sessionData } = useSession()
  const { data: deviceSessions } = useListDeviceSessions()

  return (
    <DropdownMenuSubContent className="min-w-40 md:min-w-56 max-w-[48svw]">
      <DropdownMenuItem>
        <UserView />

        <Check className="ml-auto" />
      </DropdownMenuItem>

      {deviceSessions
        ?.filter(
          (deviceSession) =>
            deviceSession.session.id !== sessionData?.session.id
        )
        .map((deviceSession) => (
          <SwitchAccountItem
            key={deviceSession.session.id}
            deviceSession={deviceSession}
          />
        ))}

      <DropdownMenuSeparator />

      <DropdownMenuItem asChild>
        <Link href={`${basePaths.auth}/${viewPaths.auth.signIn}`}>
          <CirclePlus />

          {localization.auth.addAccount}
        </Link>
      </DropdownMenuItem>
    </DropdownMenuSubContent>
  )
}
