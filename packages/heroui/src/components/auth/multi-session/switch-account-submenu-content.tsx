import type { MultiSessionAuthClient } from "@better-auth-ui/core/plugins/multi-session"
import { useAuth, useAuthPlugin, useSession } from "@better-auth-ui/react"
import { useListDeviceSessions } from "@better-auth-ui/react/plugins/multi-session"
import { Check, CirclePlus } from "@gravity-ui/icons"
import { Dropdown, Label } from "@heroui/react"

import { multiSessionPlugin } from "../../../lib/auth/multi-session-plugin"
import { UserView } from "../user/user-view"
import { SwitchAccountSubmenuItem } from "./switch-account-submenu-item"

/**
 * Render the submenu content for switching between multiple authenticated sessions.
 *
 * Shows the current session with a checkmark, lists other device sessions that can be activated,
 * and provides an option to add a new account. This component should be rendered inside a
 * Dropdown.SubmenuTrigger to defer the useListDeviceSessions query until the submenu is opened.
 *
 * @returns The switch account submenu content as a JSX element
 */
export function SwitchAccountSubmenuContent({
  hideSubtitle
}: {
  hideSubtitle?: boolean
}) {
  const { authClient, basePaths, viewPaths } = useAuth()
  const { localization: multiSessionLocalization } =
    useAuthPlugin(multiSessionPlugin)
  const { data: session } = useSession(authClient)
  const { data: deviceSessions, isPending } = useListDeviceSessions(
    authClient as MultiSessionAuthClient
  )

  return (
    <Dropdown.Popover className="min-w-40 md:min-w-56 max-w-[48svw]">
      <Dropdown.Menu>
        <Dropdown.Item className="px-2">
          <UserView isPending={isPending} hideSubtitle={hideSubtitle} />

          {!isPending && <Check className="ml-auto" />}
        </Dropdown.Item>

        {deviceSessions
          ?.filter(
            (deviceSession) => deviceSession.session.id !== session?.session?.id
          )
          .map((deviceSession) => (
            <SwitchAccountSubmenuItem
              key={deviceSession.session.id}
              deviceSession={deviceSession}
              hideSubtitle={hideSubtitle}
            />
          ))}

        <Dropdown.Item
          textValue={multiSessionLocalization.addAccount}
          href={`${basePaths.auth}/${viewPaths.auth.signIn}`}
        >
          <CirclePlus className="text-muted" />

          <Label>{multiSessionLocalization.addAccount}</Label>
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown.Popover>
  )
}
