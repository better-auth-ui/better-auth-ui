"use client"

import { useAuth, useAuthPlugin, useSession } from "@better-auth-ui/react"
import { ArrowLeftRight } from "lucide-react"

import {
  DropdownMenuSub,
  DropdownMenuSubTrigger
} from "@/components/ui/dropdown-menu"
import { multiSessionPlugin } from "@/lib/auth/multi-session-plugin"
import { SwitchAccountSubmenuContent } from "./switch-account-submenu-content"

export type SwitchAccountSubmenuProps = {
  className?: string
}

/**
 * Render a submenu trigger for switching between multiple authenticated sessions.
 *
 * This component renders as a dropdown menu item that opens a submenu containing
 * the switch account menu. It should be rendered inside the UserButton dropdown
 * as a userMenuItem from the multiSessionPlugin.
 *
 * @param className - Optional additional CSS class names
 * @returns The switch account submenu as a JSX element
 */
export function SwitchAccountSubmenu({ className }: SwitchAccountSubmenuProps) {
  const { authClient } = useAuth()
  const { data: session } = useSession(authClient)
  const { localization: multiSessionLocalization } =
    useAuthPlugin(multiSessionPlugin)

  if (!session) {
    return null
  }

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger className={className}>
        <ArrowLeftRight className="text-muted-foreground" />

        {multiSessionLocalization.switchAccount}
      </DropdownMenuSubTrigger>

      <SwitchAccountSubmenuContent />
    </DropdownMenuSub>
  )
}
