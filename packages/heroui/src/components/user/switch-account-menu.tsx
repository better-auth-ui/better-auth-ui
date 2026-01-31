import {
  useAuth,
  useListDeviceSessions,
  useSession
} from "@better-auth-ui/react"
import { Check, CirclePlus } from "@gravity-ui/icons"
import { Dropdown, Label, Separator } from "@heroui/react"

import { SwitchAccountItem } from "./switch-account-item"
import { UserView } from "./user-view"

/**
 * Render the menu content for switching between multiple authenticated sessions.
 *
 * Shows the current session with a checkmark, lists other device sessions that can be activated,
 * and provides an option to add a new account. This component should be rendered inside a
 * Dropdown.SubmenuTrigger to defer the useListDeviceSessions query until the submenu is opened.
 *
 * @returns The switch account menu content as a JSX element
 */
export function SwitchAccountMenu() {
  const { basePaths, viewPaths, localization } = useAuth()
  const { data: sessionData } = useSession()
  const { data: deviceSessions, isPending } = useListDeviceSessions()

  return (
    <Dropdown.Popover className="min-w-40 md:min-w-56 max-w-[48svw]">
      <Dropdown.Menu>
        <Dropdown.Item className="px-2">
          <UserView isPending={isPending} />

          {!isPending && <Check className="ml-auto" />}
        </Dropdown.Item>

        {deviceSessions
          ?.filter(
            (deviceSession) =>
              deviceSession.session.id !== sessionData?.session?.id
          )
          .map((deviceSession) => (
            <SwitchAccountItem
              key={deviceSession.session.id}
              deviceSession={deviceSession}
            />
          ))}

        <Separator />

        <Dropdown.Item
          textValue={localization.auth.addAccount}
          href={`${basePaths.auth}/${viewPaths.auth.signIn}`}
        >
          <CirclePlus className="text-muted" />

          <Label>{localization.auth.addAccount}</Label>
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown.Popover>
  )
}
