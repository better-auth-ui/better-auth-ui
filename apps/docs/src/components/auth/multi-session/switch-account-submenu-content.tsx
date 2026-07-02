"use client"

import type { MultiSessionAuthClient } from "@better-auth-ui/core/plugins/multi-session"
import { useAuth, useAuthPlugin, useSession } from "@better-auth-ui/react"
import { useListDeviceSessions } from "@better-auth-ui/react/plugins/multi-session"
import { Check, CirclePlus } from "lucide-react"
import { UserView } from "@/components/auth/user/user-view"
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSubContent
} from "@/components/ui/dropdown-menu"
import { multiSessionPlugin } from "@/lib/auth/multi-session-plugin"
import { SwitchAccountSubmenuItem } from "./switch-account-submenu-item"

/**
 * Render the submenu content for switching between multiple authenticated sessions.
 *
 * Shows the current session with a checkmark, lists other device sessions that can be activated,
 * and provides an option to add a new account. This component should be rendered inside a
 * DropdownMenuSub to defer the useListDeviceSessions query until the submenu is opened.
 *
 * @returns The switch account submenu content as a JSX element
 */
export function SwitchAccountSubmenuContent() {
  const { authClient, basePaths, viewPaths, navigate } =
    useAuth<MultiSessionAuthClient>()
  const { localization: multiSessionLocalization } =
    useAuthPlugin(multiSessionPlugin)
  const { data: session } = useSession(authClient)
  const { data: deviceSessions, isPending } = useListDeviceSessions(authClient)

  return (
    <DropdownMenuSubContent className="min-w-48 md:min-w-56 max-w-[48svw]">
      <DropdownMenuItem>
        <UserView isPending={isPending} />

        {!isPending && <Check className="ml-auto" />}
      </DropdownMenuItem>

      {deviceSessions
        ?.filter(
          (deviceSession) => deviceSession.session.id !== session?.session.id
        )
        .map((deviceSession) => (
          <SwitchAccountSubmenuItem
            key={deviceSession.session.id}
            deviceSession={deviceSession}
          />
        ))}

      <DropdownMenuSeparator />

      <DropdownMenuItem
        onClick={() =>
          navigate({ to: `${basePaths.auth}/${viewPaths.auth.signIn}` })
        }
      >
        <CirclePlus className="text-muted-foreground" />

        {multiSessionLocalization.addAccount}
      </DropdownMenuItem>
    </DropdownMenuSubContent>
  )
}
