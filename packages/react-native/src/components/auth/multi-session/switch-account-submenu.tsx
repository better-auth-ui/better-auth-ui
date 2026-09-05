import { useAuth, useAuthPlugin, useSession } from "@better-auth-ui/react"
import { useState } from "react"
import { multiSessionPlugin } from "../../../lib/auth/multi-session-plugin"
import { cn } from "../../../lib/cn"
import { useThemeColors } from "../../../lib/theme-colors"
import { Menu } from "../../../primitives/menu"
import { Btn, Txt } from "../../../primitives/styled"
import { ArrowRightArrowLeft } from "../../../primitives/ui-icons"
import { SwitchAccountSubmenuContent } from "./switch-account-submenu-content"

export type SwitchAccountSubmenuProps = {
  className?: string
  hideSubtitle?: boolean
}

/**
 * Render a `userMenuItem` row that opens the account-switcher submenu.
 *
 * Mirrors the heroui `SwitchAccountSubmenu`'s nested-dropdown design, adapted
 * for React Native: it renders as a flat row (meant to sit inside
 * `UserButton`'s bottom-sheet menu) that, on press, opens a second `Menu`
 * bottom-sheet stacked on top containing `SwitchAccountSubmenuContent` (the
 * current session with a checkmark, other device sessions, "Add Account").
 * Rendering that content only while the menu `isOpen` defers its
 * `useListDeviceSessions` query until the user actually opens the submenu,
 * matching the web version's lazy-fetch-on-open intent. Bails (`return
 * null`) when there is no active session.
 *
 * @param className - Optional additional classes applied to the trigger row
 * @param hideSubtitle - When true, hides the subtitle line (email) in every row
 * @returns The switch-account menu item (and its submenu) as a JSX element
 */
export function SwitchAccountSubmenu({
  className,
  hideSubtitle
}: SwitchAccountSubmenuProps) {
  const { authClient } = useAuth()
  const { data: session } = useSession(authClient)
  const { localization: multiSessionLocalization } =
    useAuthPlugin(multiSessionPlugin)
  const colors = useThemeColors()

  const [open, setOpen] = useState(false)

  if (!session) {
    return null
  }

  return (
    <>
      <Btn
        className={cn("flex-row items-center gap-2 px-3 py-2", className)}
        onPress={() => setOpen(true)}
      >
        <ArrowRightArrowLeft width={18} height={18} color={colors.muted} />
        <Txt className="text-sm text-foreground">
          {multiSessionLocalization.switchAccount}
        </Txt>
      </Btn>

      <Menu isOpen={open} onOpenChange={setOpen}>
        {open && <SwitchAccountSubmenuContent hideSubtitle={hideSubtitle} />}
      </Menu>
    </>
  )
}
