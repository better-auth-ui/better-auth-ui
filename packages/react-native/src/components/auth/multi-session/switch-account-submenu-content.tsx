import {
  type MultiSessionAuthClient,
  useAuth,
  useAuthPlugin,
  useListDeviceSessions,
  useSession,
  useSetActiveSession
} from "@better-auth-ui/react"
import { multiSessionPlugin } from "../../../lib/auth/multi-session-plugin"
import { useThemeColors } from "../../../lib/theme-colors"
import { useAuthNavigation } from "../../../navigation/navigation-context"
import { Menu } from "../../../primitives/menu"
import { Spinner } from "../../../primitives/spinner"
import { Box } from "../../../primitives/styled"
import { Check, CirclePlus } from "../../../primitives/ui-icons"
import { UserView } from "../user/user-view"

export type SwitchAccountSubmenuContentProps = {
  /**
   * Closes the enclosing `Menu` after a row is pressed. Since `Menu`'s
   * auto-close wiring only applies to its own direct `Menu.Item` children
   * (and this content is typically rendered one level deeper, inside the
   * `Menu`'s children), pass the enclosing menu's `onOpenChange(false)` here
   * so rows still dismiss it after switching/adding an account. Optional —
   * omit if the parent handles dismissal another way.
   */
  onOpenChange?: (open: boolean) => void
  hideSubtitle?: boolean
}

/**
 * Render the switcher list body (accounts + add-account) as `Menu.Item` rows.
 *
 * Shows the current session with a checkmark, lists other device sessions
 * that can be activated, and provides an option to add a new account. Meant
 * to be rendered as the direct children of a `Menu` owned by a parent (e.g.
 * `SwitchAccountSubmenu`), so `useListDeviceSessions` only runs once that menu
 * is opened/mounted — mirrors heroui's `SwitchAccountSubmenuContent` (a
 * `Dropdown.Popover` + `Dropdown.Menu`) deferring its query until the submenu
 * opens. Adapted for React Native: rows become `Menu.Item`s, and the
 * "switch to this session" action (heroui's `SwitchAccountSubmenuItem`) is
 * inlined here since RN has no separate submenu-item primitive to reuse.
 * Since `Menu`'s auto-close/selection wiring only applies to its own direct
 * `Menu.Item` children, `onOpenChange` is threaded through explicitly so rows
 * close the menu themselves after acting, however deep this component is
 * composed.
 */
export function SwitchAccountSubmenuContent({
  onOpenChange,
  hideSubtitle
}: SwitchAccountSubmenuContentProps) {
  const { authClient } = useAuth()
  const { localization: multiSessionLocalization } =
    useAuthPlugin(multiSessionPlugin)
  const colors = useThemeColors()
  const navigation = useAuthNavigation()

  const { data: session } = useSession(authClient)
  const { data: deviceSessions, isPending } = useListDeviceSessions(
    authClient as MultiSessionAuthClient
  )

  const { mutate: setActiveSession, isPending: isSwitching } =
    useSetActiveSession(authClient as MultiSessionAuthClient)

  const otherSessions = deviceSessions?.filter(
    (deviceSession) => deviceSession.session.id !== session?.session?.id
  )

  return (
    <>
      <Menu.Item className="px-2" isDisabled>
        <Box className="flex-1 flex-row items-center">
          <UserView isPending={isPending} hideSubtitle={hideSubtitle} />

          {!isPending && (
            <Check
              width={16}
              height={16}
              color={colors.accent}
              className="ml-auto"
            />
          )}
        </Box>
      </Menu.Item>

      {otherSessions?.map((deviceSession) => (
        <Menu.Item
          key={deviceSession.session.id}
          className="px-2"
          isDisabled={isSwitching}
          onPress={() => {
            setActiveSession({ sessionToken: deviceSession.session.token })
            onOpenChange?.(false)
          }}
        >
          <Box className="flex-1 flex-row items-center">
            <UserView user={deviceSession.user} hideSubtitle={hideSubtitle} />

            {isSwitching && (
              <Spinner size="sm" color="current" className="ml-auto" />
            )}
          </Box>
        </Menu.Item>
      ))}

      <Menu.Item
        icon={<CirclePlus width={18} height={18} color={colors.muted} />}
        onPress={() => {
          onOpenChange?.(false)
          navigation.push("signIn")
        }}
      >
        {multiSessionLocalization.addAccount}
      </Menu.Item>
    </>
  )
}
